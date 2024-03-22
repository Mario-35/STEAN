/**
 * pgVisitor for odata.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { addDoubleQuotes, addSimpleQuotes, isGraph, isNull, isObservation, isTest, removeAllQuotes, returnFormats } from "../../helpers";
import { IodataContext, IKeyString, IreturnFormat, Ientity, IKeyBoolean, IpgQuery } from "../../types";
import { Token } from "../parser/lexer";
import { Literal } from "../parser/literal";
import { SQLLiteral } from "../parser/sqlLiteral";
import { SqlOptions } from "../parser/sqlOptions";
import koa from "koa";
import { formatLog } from "../../logger";
import { createGetSql, createPostSql, oDatatoDate } from "./helper";
import { errors, msg } from "../../messages/";
import { EcolType, EextensionsType } from "../../enums";
import { models } from "../../models";
import { log } from "../../log";
import { _COLUMNSEPARATOR } from "../../constants";

export class PgVisitor {
  public ctx: koa.Context;
  public options: SqlOptions;
  // public query: IpgQuery | undefined = undefined; 
  // main entity
  public entity = "";
  // parent entity
  parentEntity: string | undefined = undefined;  
  id: bigint | string = BigInt(0);
  parentId: bigint | string = BigInt(0);
  arrayNames: string[] = [];
  select = "";
  where = "";
  orderby = "";
  intervalColumns: string[] | undefined = undefined;
  groupBy: string[] = [];
  expand: string[] = [];
  splitResult: string[] | undefined;
  interval: string | undefined;
  payload: string | undefined;
  skip = 0;
  limit = 0;
  count = false;
  valueskeys = false;
  onlyRef = false;
  onlyValue = false;
  numeric = false;
  returnNull = false;
  navigationProperty: string;
  resultFormat: IreturnFormat = returnFormats.json;
  includes: PgVisitor[] = [];
  parameters: unknown[] = [];
  ast: Token;
  showRelations = true;
  results: IKeyString = {};
  sql = "";
  pgQuery: IpgQuery | undefined = undefined;
  debugOdata = isTest() ? false : true;
  constructor(ctx: koa.Context, options = <SqlOptions>{}) {
    this.ctx = ctx;
    this.options = options;
    this.onlyRef = options.onlyRef;
    this.onlyValue = options.onlyValue;
    this.valueskeys = options.valueskeys;
    this.resultFormat =  (options.onlyValue === true) ? returnFormats.txt : returnFormats.json;
  }
  
  // ***********************************************************************************************************************************************************************
  // ***                                                           ROSSOURCES                                                                                            ***
  // ***********************************************************************************************************************************************************************
  public noLimit() {
    this.limit = 0;
    this.skip = 0;
  }

  addToArrayNames(key: string | string[]) {
    const addTo = (input: string[]) => {
      input.forEach(key =>  {
        key = key.includes(" AS ") ? key.split(" AS ")[1] : key;
        key = key.includes(".") ? key.split(".")[1] : key;
        if(!this.arrayNames.includes(key) && key.trim() !== "") this.arrayNames.push(key);      
      });
    }
    addTo((typeof key === "string") ? [key] : key);    
  }

  addToIntervalColumns(input: string) {
    // TODO test with create    
    if (input.endsWith('Time"')) input = `step AS ${input}`;
      else if (input === '"@iot.id"') input = `coalesce("@iot.id", 0) AS "@iot.id"`;
        else if (input.startsWith("CONCAT")) input = `${input}`;
          else if (input[0] !== "'") input = `${input}`;
    if (this.intervalColumns) this.intervalColumns.push(input); 
      else this.intervalColumns = [input];
  }

  protected getColumn(input: string, operation: string ,context: IodataContext ) {   
    const tempEntity = 
      this.isWhere(context) && context.identifier
        ? models.getEntity(this.ctx.config, context.identifier.split(".")[0])
        : this.isSelect(context) 
          ? models.getEntity(this.ctx.config, this.entity || this.parentEntity || this.navigationProperty) 
          : undefined;    
    const columnName = input === "result" 
                        ? this.getColumnResult(context, operation) 
                        : tempEntity 
                          ? this.getColumnNameOrAlias(tempEntity, input, this.createDefaultOptions()) 
                          : undefined;
    if (columnName) return columnName;
    if (this.isSelect(context) && tempEntity && tempEntity.relations[input]) {
      const entityName = models.getEntityName(this.ctx.config ,input);       
      return tempEntity && entityName 
        ? `CONCAT('${this.ctx.decodedUrl.root}/${tempEntity.name}(', "${tempEntity.table}"."id", ')/${entityName}') AS "${entityName}@iot.navigationLink"` 
        : undefined;    
    }   
  }

  init(node: Token) {
    console.log(formatLog.head("INIT PgVisitor"));
    this.limit = this.ctx.config.nb_page || 200;
    this.numeric = this.ctx.config.extensions.includes(EextensionsType.numeric);
    const temp = this.VisitRessources(node);
    this.verifyRessources();
    return temp;
  }

  protected verifyRessources = (): void => {
    console.log(formatLog.head("verifyRessources"));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected VisitRessources(node: Token, context?: IodataContext) {
    const ressource = this[`VisitRessources${node.type}`];
    if (ressource) {
      ressource.call(this, node, context);
      if (this.debugOdata) {
        console.log(formatLog.debug("VisitRessources",`VisitRessources${node.type}`));
        console.log(formatLog.result("node.raw", node.raw));
      }
    } else {
      log.errorMsg(`Ressource Not Found ============> VisitRessources${node.type}`);
      throw new Error(`Unhandled node type: ${node.type}`);
    }
    return this;
  }

  protected VisitRessourcesResourcePath(node: Token, context: IodataContext) {
    if (node.value.resource && node.value.resource.type == "EntitySetName") {
      this.entity = node.value.resource.raw;
    }
    if (node.value.navigation)
      this.VisitRessources(node.value.navigation, context);
  }
  
  protected VisitRessourcesEntitySetName(node: Token, _context: IodataContext) {
    this.entity = node.value.raw;
  }
 
  protected VisitRessourcesRefExpression(node: Token, _context: IodataContext) {
    if (node.type == "RefExpression" && node.raw == "/$ref")
      this.onlyRef = true;
  }
 
  protected VisitRessourcesValueExpression(node: Token, _context: IodataContext) {
    if (node.type == "ValueExpression" && node.raw == "/$value")
      this.onlyValue = true;
  }
 
  protected VisitRessourcesCollectionNavigation(node: Token, context: IodataContext) {
    if (node.value.path) this.VisitRessources(node.value.path, context);
  }
 
  protected VisitRessourcesCollectionNavigationPath(node: Token, context: IodataContext) {
    if (node.value.predicate)
      this.VisitRessources(node.value.predicate, context);
    if (node.value.navigation)
      this.VisitRessources(node.value.navigation, context);
  }
 
  protected VisitRessourcesSimpleKey(node: Token, context: IodataContext) {
    if (node.value.value.type === "KeyPropertyValue")
      this.VisitRessources(node.value.value, context);
  }
 
  protected VisitRessourcesKeyPropertyValue(node: Token, _context: IodataContext) {
    this.id = this.ctx.decodedUrl.idStr
                ? this.ctx.decodedUrl.idStr
                  : node.value == "Edm.SByte"
                      ? BigInt(node.raw)
                      : node.raw;

      
    this.where = this.ctx.decodedUrl.idStr ? `"lora"."deveui" = '${this.ctx.decodedUrl.idStr}'` : `id = ${this.id}`;
  }

  protected VisitRessourcesSingleNavigation(node: Token, context: IodataContext) {
    if (node.value.path && node.value.path.type === "PropertyPath")
      this.VisitRessources(node.value.path, context);
  }
 
  protected VisitRessourcesPropertyPath(node: Token, context: IodataContext) {
    let tempNode = node;
    if (node.type == "PropertyPath") {
      if (models.getRelationColumnTable(this.ctx.config, this.entity, node.value.path.raw) === EcolType.Relation) {
        this.parentId = this.id;
        this.id = BigInt(0);
        if (
          node.value.navigation &&
          node.value.navigation.type == "CollectionNavigation"
        ) {
          tempNode = node.value.navigation;
          if (tempNode.value.path.type === "CollectionNavigationPath") {
            tempNode = tempNode.value.path;
            if (tempNode.value.predicate.type === "SimpleKey") {
              tempNode = tempNode.value.predicate.value;
              if (tempNode.value.type === "KeyPropertyValue")
                this.id = tempNode.value.raw;
            }
          }
        }
        
        const tmpLink = this.ctx.model[this.entity].relations[node.value.path.raw].link
          .split("$ID")
          .join(<string>this.parentId);
        const tmpLinkSplit = tmpLink.split("in (");
        if (BigInt(this.id) > 0) {
          this.where = `${tmpLinkSplit[0]} = (SELECT id FROM (${tmpLinkSplit[1]} as l WHERE id = ${this.id})`;
        } else this.where = tmpLink;
        this.parentEntity = this.entity;
        this.entity = node.value.path.raw;
      } else if (this.ctx.model[this.entity].columns[node.value.path.raw]) {
        this.select = `${addDoubleQuotes(node.value.path.raw )}${_COLUMNSEPARATOR}`;
        this.showRelations = false;
      } else this.entity = node.value.path.raw;
    }
  }

  protected VisitRessourcesODataUri(node: Token, context: IodataContext) {
    this.VisitRessources(node.value.resource, context);
    this.VisitRessources(node.value.query, context);
  }

  createGetSql(): string | undefined {
    try {
      return createGetSql(this);
    } catch (error) {
      return undefined;
    }
  }

  createPatchSql(datas: object): string | undefined {
    try {
      return createPostSql(datas, this);
    } catch (error) {
      return undefined;
    }
  }

  createPostSql(datas: object): string | undefined {
    try {
      return createPostSql(datas, this);
    } catch (error) {
      return undefined;
    }
  }

  // ***********************************************************************************************************************************************************************
  // ***                                                              QUERY                                                                                              ***
  // ***********************************************************************************************************************************************************************

  getColumnResult(context: IodataContext, operation: string, ForceString?: boolean) {
    switch (context.target) {
      case "where":
        const nbs = Array.from({length: 5}, (v, k) => k+1);
        const translate = `TRANSLATE (SUBSTRING ("result"->>'value' FROM '(([0-9]+.*)*[0-9]+)'), '[]','')`;
        const isOperation = operation.trim() != "";
        return ForceString 
          ? `@EXPRESSIONSTRING@ ANY (ARRAY_REMOVE( ARRAY[\n${nbs.map(e => `${isOperation ? `${operation} (` : ''} SPLIT_PART ( ${translate}, ',', ${e}))`).join(",\n")}], null))`
          : `@EXPRESSION@ ANY (ARRAY_REMOVE( ARRAY[\n${nbs.map(e => `${isOperation ? `${operation} (` : ''}NULLIF (SPLIT_PART ( ${translate}, ',', ${e}),'')::numeric${isOperation ? `)` : ''}`).join(",\n")}], null))`;
    default:
      return `CASE 
          WHEN JSONB_TYPEOF( "result"->'value') = 'number' THEN ("result"->${this.numeric == true? '>': ''}'value')::jsonb
          WHEN JSONB_TYPEOF( "result"->'value') = 'array'  THEN ("result"->'${this.valueskeys == true ? 'valueskeys' : 'value'}')::jsonb
      END${this.isSelect(context) === true ? ' AS "result"' : ''}`;
  }
}

  getColumnNameOrAlias(entity: Ientity, column : string, options: IKeyBoolean): string | undefined {
    let result: string | undefined = undefined;
    if (entity && column != "" && entity.columns[column]) {
      result =  entity.columns[column].columnAlias(this.ctx.config, options);
      if (!result) result =  addDoubleQuotes(column);
    }
    return result ? `${ options.table === true && result && result[0] === '"' ? `"${entity.table}".${result}` : result }` : undefined;
  }; 

  clear(input: string) {    
    if (input.includes('@START@')) {
      input = input.split('@START@').join("(");
      input = input.split('@END@').join('') +')';      
    }
    return input;    
  }

  start(node: Token) {
    console.log(formatLog.head("Start PgVisitor"));
    const temp = this.Visit(node);
    this.verifyQuery();    
    // Logs.infos("PgVisitor", temp);
    if (temp.where) temp.where = this.clear(temp.where);    
    return temp;
  }

  verifyQuery = (): void => {
    console.log(formatLog.head("verifyQuery"));
    const expands: string[] = [];
    this.includes.forEach((element: PgVisitor) => {
      if (element.ast.type === "ExpandItem")
        expands.push(element.ast.raw.split("(")[0]);
    });

    expands.forEach((elem: string) => {
      const elems = elem.split("/");
      elems.unshift(this.entity);
      if (elems[0]) {
        if (!Object.keys(this.ctx.model[elems[0]].relations).includes(elems[1]))
          this.ctx.throw(400, {
            detail: `Invalid expand path ${elems[1]} for ${elems[0]}`,
          });
      } else this.ctx.throw(400, { detail: msg(errors.invalid, "entity") + elems[0] });
    });

    if (isObservation(this.entity) === true && this.splitResult !== undefined && Number(this.parentId) == 0 ) {
      this.ctx.throw(400, { detail: errors.splitNotAllowed });
    }

    if (this.resultFormat === returnFormats.dataArray && BigInt(this.id) > 0 && !this.parentEntity) {
      this.ctx.throw(400, { detail: errors.dataArrayNotAllowed });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Visit(node: Token, context?: any) {
    this.ast = this.ast || node;
    context = context || { target: "where" };

    if (node) {
      const visitor = this[`Visit${node.type}`];
      if (visitor) {
        visitor.call(this, node, context);
        if (this.debugOdata) {
          console.log(formatLog.debug("Visit",`Visit${node.type}`, ));
          console.log(formatLog.result("node.raw", node.raw));
          console.log(formatLog.result("this.where", this.where)); 
          console.log(formatLog.result("this.select", this.select)); 
          console.log(formatLog.result("this.arrayNames", this.arrayNames)); 
          console.log(formatLog.debug("context", context));
        }

      } else {
        log.errorMsg(`Node error =================> Visit${node.type}`);
        log.errorMsg(node);
        throw new Error(`Unhandled node type: ${node.type}`);
      }
    }

    if (node == this.ast) {
      if (this.entity.startsWith("Lora")) {
        if (typeof this.id == "string") {
          this.where = `"lora"."deveui" = '${this.id}'`;
        }
      }
    }
    return this;
  }

  isWhere  = (context: IodataContext): boolean => (context.target ? context.target === "where" : false);
  isSelect = (context: IodataContext): boolean => (context.target ? context.target === "select" : false);

 
  protected VisitExpand(node: Token, context: IodataContext) {
    node.value.items.forEach((item: Token) => {
      const expandPath = item.value.path.raw;
      let visitor = this.includes.filter( (v) => v.navigationProperty == expandPath )[0];
      if (!visitor) {
        visitor = new PgVisitor(this.ctx, { ...this.options });
        this.includes.push(visitor);
      }
      visitor.Visit(item);
    });
  }

  protected VisitEntity(node: Token, context: IodataContext) {
    this.Visit(node.value.path, context);
    if (node.value.options)
      node.value.options.forEach((item: Token) => this.Visit(item, context));
  }

  protected VisitSplitResult(node: Token, context: IodataContext) {
    this.Visit(node.value.path, context);
    if (node.value.options)
      node.value.options.forEach((item: Token) => this.Visit(item, context));
    this.splitResult = removeAllQuotes(node.value).split(",");
  }

  protected VisitInterval(node: Token, context: IodataContext) {
    this.Visit(node.value.path, context);
    if (node.value.options)
      node.value.options.forEach((item: Token) => this.Visit(item, context));
    this.interval = node.value;
    if (this.interval) this.noLimit();
  }

  protected VisitPayload(node: Token, context: IodataContext) {
    this.Visit(node.value.path, context);
    if (node.value.options)
      node.value.options.forEach((item: Token) => this.Visit(item, context));
    this.payload = node.value;
  }

  protected VisitDebug(node: Token, context: IodataContext) {
    this.Visit(node.value.path, context);
    if (node.value.options)
      node.value.options.forEach((item: Token) => this.Visit(item, context));
    // do Nothing
  }
 
  protected VisitResultFormat(node: Token, context: IodataContext) {
    if (node.value.format) 
      this.resultFormat = returnFormats[node.value.format];
    if ( [ returnFormats.dataArray, returnFormats.graph, returnFormats.graphDatas, returnFormats.csv ].includes(this.resultFormat) ) 
      this.noLimit();
      this.showRelations = false;
    if (isGraph(this)) { 
      this.showRelations = false; 
      this.orderby += '"resultTime" ASC'; 
    }
  }

  protected VisitExpandItem(node: Token, context: IodataContext) {
    this.Visit(node.value.path, context);
    if (node.value.options)
      node.value.options.forEach((item: Token) => this.Visit(item, context));
  }
 
  protected VisitExpandPath(node: Token, context: IodataContext) {
    this.navigationProperty = node.raw;
  }

  // Start loop process
  protected VisitQueryOptions(node: Token, context: IodataContext) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node.value.options.forEach((option: any) => this.Visit(option, context));
  }
 
  protected VisitInlineCount(node: Token, context: IodataContext) {
    this.count = Literal.convert(node.value.value, node.value.raw);
  }

  protected VisitFilter(node: Token, context: IodataContext) {
    context.target = "where";
    if (this.where.trim() != "") this.where += " AND ";
    this.Visit(node.value, context);
  }

  protected VisitOrderBy(node: Token, context: IodataContext) {    
    context.target = "orderby";
    node.value.items.forEach((item: Token, i: number) => {
      this.Visit(item, context);
      if (i < node.value.items.length - 1) this.orderby += ", ";
    });
  }

  protected VisitOrderByItem(node: Token, context: IodataContext) {
    this.Visit(node.value.expr, context);
    if (!isNull(this.orderby)) this.orderby += node.value.direction > 0 ? " ASC" : " DESC";
  }
 
  protected VisitSkip(node: Token, context: IodataContext) {
    this.skip = +node.value.raw;
  }
 
  protected VisitTop(node: Token, context: IodataContext) {
    this.limit = +node.value.raw;
  }

  protected VisitSelect(node: Token, context: IodataContext) {
    context.target = "select";
    node.value.items.forEach((item: Token) => {
      this.Visit(item, context);
    });
  }

  protected VisitSelectItem(node: Token, context: IodataContext) {
    const tempColumn = this.getColumn(node.raw, "", context); 
    context.identifier = tempColumn ? tempColumn : node.raw;
    if (context.target)
      this[context.target] += tempColumn ? `${tempColumn}${_COLUMNSEPARATOR}` : `${addDoubleQuotes(node.raw)}${_COLUMNSEPARATOR}`; 
      this.addToArrayNames(context.identifier.includes(" AS ") ? context.identifier.split(" AS ")[1] : context.identifier);
      this.showRelations = false;
  }

  protected VisitAndExpression(node: Token, context: IodataContext) {
    this.Visit(node.value.left, context);
    this.where += context.in && context.in === true ? " INTERSECT " : " AND ";
    this.Visit(node.value.right, context);
  }

  protected VisitOrExpression(node: Token, context: IodataContext) {
    this.Visit(node.value.left, context);
    this.where += " OR ";
    this.Visit(node.value.right, context);
  }

  protected VisitNotExpression(node: Token, context: IodataContext) {
    this.where += " NOT ";
    this.Visit(node.value, context);
  }

  protected VisitBoolParenExpression(node: Token, context: IodataContext) {
    this.where += "(";
    this.Visit(node.value, context);
    this.where += ")";
  }

  protected VisitCommonExpression(node: Token, context: IodataContext) {
    this.Visit(node.value, context);
  }

  protected VisitFirstMemberExpression(node: Token, context: IodataContext) {   
    this.Visit(node.value, context);
  }

  protected VisitMemberExpression(node: Token, context: IodataContext) {
    this.Visit(node.value, context);
  }

  protected VisitPropertyPathExpression(node: Token, context: IodataContext) {
    if (node.value.current && node.value.next) {
      // deterwine if its column AND JSON
      if (models.getRelationColumnTable(this.ctx.config, this.ctx.model[this.entity], node.value.current.raw) === EcolType.Column
            && models.isColumnType(this.ctx.config, this.ctx.model[this.entity], node.value.current.raw, "json") 
            && node.value.next.raw[0] == "/" ) {
              this.where += `${addDoubleQuotes(node.value.current.raw)}->>${addSimpleQuotes(node.value.next.raw.slice(1))}`;
      } else if (node.value.next.raw[0] == "/") {       
        this.Visit(node.value.current, context);
        context.identifier += ".";
        this.Visit(node.value.next, context);
      } else {
        this.Visit(node.value.current, context);
        context.identifier += ".";
        this.Visit(node.value.next, context);
      }
    } else this.Visit(node.value, context);
  }

  protected VisitSingleNavigationExpression(node: Token, context: IodataContext) {
    if (node.value.current && node.value.next) {
      this.Visit(node.value.current, context);
      this.Visit(node.value.next, context);
    } else this.Visit(node.value, context);
  }

  protected VisitLesserThanExpression(node: Token, context: IodataContext) {
    context.sign = "<";
    if (!this.VisitDateType(node, context)) {
      this.Visit(node.value.left, context);
      this.addExpressionToWhere(node, context);
      this.Visit(node.value.right, context);
    }
  }

  protected VisitLesserOrEqualsExpression(node: Token, context: IodataContext) {
    context.sign = "<=";
    if (!this.VisitDateType(node, context)) {
      this.Visit(node.value.left, context);
      this.addExpressionToWhere(node, context);
      this.Visit(node.value.right, context);
    }
  }

  protected VisitDateType(node: Token, context: IodataContext):boolean {  
    if (context.sign && models.getRelationColumnTable(this.ctx.config, this.ctx.model[this.entity], node.value.left.raw) === EcolType.Column && models.isColumnType(this.ctx.config, this.ctx.model[this.entity], node.value.left.raw, "date")) {
      const testIsDate = oDatatoDate(node, context.sign);
      const columnName = this.getColumnNameOrAlias(this.ctx.model[context.identifier || this.entity], node.value.left.raw, {table: true, as: true, cast: false, ...this.createDefaultOptions()});
      if (testIsDate) {
        this.where += `${columnName 
                          ? columnName 
                          : `${addDoubleQuotes(node.value.left.raw)}`}${testIsDate}`;
        return true;
      }
    }
    return false;
  }

  protected addExpressionToWhere(node: Token, context: IodataContext) {    
    this.where = this.where.includes("@EXPRESSION@") 
      ? this.where.replace("@EXPRESSION@",`@EXPRESSION@ ${context.sign}`) 
      : this.where = this.where.includes("@EXPRESSIONSTRING@") 
        ? this.where.replace("@EXPRESSIONSTRING@",`@EXPRESSIONSTRING@`) 
        : `${this.where} ${context.sign} `;
  }

  protected VisitGreaterThanExpression(node: Token, context: IodataContext) {
    context.sign = ">";
    if (!this.VisitDateType(node, context)) {
      this.Visit(node.value.left, context);
      this.addExpressionToWhere(node, context);
      this.Visit(node.value.right, context);
    }
  }

  protected VisitGreaterOrEqualsExpression(node: Token, context: IodataContext) {
    context.sign = ">=";
    if (!this.VisitDateType(node, context)) {
      this.Visit(node.value.left, context);
      this.addExpressionToWhere(node, context);
      this.Visit(node.value.right, context);
    }
  }

  public createDefaultOptions(): IKeyBoolean {
    return {
      valueskeys: this.valueskeys,
      numeric: this.numeric
    };
  }

  public createComplexWhere(entity: string, node: Token, context: IodataContext) {
    if (context.target) {
      const tempEntity = models.getEntity(this.ctx.config, entity);
      if (!tempEntity) return;
      const colType = models.getRelationColumnTable(this.ctx.config, tempEntity, node.value.name);
      if (colType === EcolType.Column) { 
      
        if (context.relation) {
          if ( Object.keys(tempEntity.relations).includes(context.relation) ) {
            if (!context.key) {
              context.key = tempEntity.relations[context.relation].entityColumn; 
              this[context.target] += addDoubleQuotes(context.key);
            }
          }
        }
      } else if (colType === EcolType.Relation) {
        const tempEntity = models.getEntity(this.ctx.config, node.value.name);
        if (tempEntity) {
          if (context.relation) {
            context.sql = `${addDoubleQuotes(this.ctx.model[entity].table)}.${addDoubleQuotes(this.ctx.model[entity].relations[node.value.name].entityColumn)} IN (SELECT ${addDoubleQuotes(tempEntity.table)}.${addDoubleQuotes(this.ctx.model[entity].relations[node.value.name].relationKey)} FROM ${addDoubleQuotes(tempEntity.table)}`;
          } else context.relation = node.value.name;
          if (!context.key) {
            context.key = this.ctx.model[entity].relations[context.relation].entityColumn; 
            this[context.target] = addDoubleQuotes(this.ctx.model[entity].relations[context.relation].entityColumn);
          }
          return;
        }
      }
    }
  }

  protected VisitODataIdentifier(node: Token, context: IodataContext) {
    const alias = this.getColumn(node.value.name, "", context);
    node.value.name = alias ? alias : node.value.name;
    if (context.relation && context.identifier && models.isColumnType(this.ctx.config, this.ctx.model[context.relation], removeAllQuotes(context.identifier).split(".")[0], "json")) {
      context.identifier = `${addDoubleQuotes(context.identifier.split(".")[0])}->>${addSimpleQuotes(node.raw)}`;     
    } else {      
      if (this.isWhere(context)) this.createComplexWhere(context.identifier ? context.identifier.split(".")[0] : this.entity, node, context);
      if (!context.relation && !context.identifier && alias && context.target) {       
        this[context.target] += alias;  
      } else {        
        context.identifier = node.value.name;
        if (context.target && !context.key) {
          const alias = this.getColumnNameOrAlias(this.ctx.model[this.entity], node.value.name, this.createDefaultOptions());
          this[context.target] += node.value.name.includes("->>") ||node.value.name.includes("->") || node.value.name.includes("::")
            ? node.value.name
            : this.entity && this.ctx.model[this.entity] 
              ? alias 
                ? alias 
                : ''
              : addDoubleQuotes(node.value.name);
          }
      }
    }    
  }
  
  protected VisitEqualsExpression(node: Token, context: IodataContext): void {
    context.sign = "=";
    if (!this.VisitDateType(node, context)) {   
      this.Visit(node.value.left, context);
      this.addExpressionToWhere(node, context);
      this.Visit(node.value.right, context);
      this.where = this.where.replace(/= null/, "IS NULL");
    }
  }

  protected VisitNotEqualsExpression(node: Token, context: IodataContext): void {
    context.sign = "<>";
    if (!this.VisitDateType(node, context)) {
      this.Visit(node.value.left, context);
      this.addExpressionToWhere(node, context);
      this.Visit(node.value.right, context);
      this.where = this.where.replace(/<> null$/, "IS NOT NULL");
    }
  }

  protected VisitLiteral(node: Token, context: IodataContext): void {    
    if (context.relation && this.isWhere(context)) {
      const temp = this.where.split(" ").filter(e => e != ""); 
      context.sign = temp.pop(); 
      this.where = temp.join(" ");
      this.where += ` ${context.in && context.in === true ? '' : ' IN @START@'}(SELECT ${this.ctx.model[this.entity].relations[context.relation] ? addDoubleQuotes(this.ctx.model[this.entity].relations[context.relation]["relationKey"]) : `${addDoubleQuotes(this.ctx.model[context.relation].table)}."id"`} FROM ${addDoubleQuotes(this.ctx.model[context.relation].table)} WHERE `;
      context.in = true;
      if (context.identifier) {
        if (context.identifier.startsWith("CASE") || context.identifier.startsWith("("))
          this.where += `${context.identifier} ${context.sign} ${SQLLiteral.convert(node.value, node.raw)})`;
        else if (context.identifier.includes("@EXPRESSION@")) {
            const tempEntity = models.getEntity(this.ctx.config, context.relation);    
            const alias = tempEntity ? this.getColumnNameOrAlias(tempEntity, context.identifier , this.createDefaultOptions()) : undefined;
            this.where += (context.sql)
              ? `${context.sql} ${context.target} ${addDoubleQuotes(context.identifier)}))@END@`
              : `${alias ? alias : `${ context.identifier.replace("@EXPRESSION@", ` ${SQLLiteral.convert(node.value, node.raw)} ${context.sign}`) }`})`;
        } else {
          const tempEntity = models.getEntity(this.ctx.config, context.relation);    

          const quotes = context.identifier[0] === '"' ? '' : '"';
          const alias = tempEntity ? this.getColumnNameOrAlias(tempEntity, context.identifier , this.createDefaultOptions()) : undefined;

          this.where += (context.sql)
            ? `${context.sql} ${context.target} ${addDoubleQuotes(context.identifier)} ${context.sign} ${SQLLiteral.convert(node.value, node.raw)}))@END@`
            : `${alias ? '' : `${this.ctx.model[context.relation].table}.`}${alias ? alias : `${quotes}${ context.identifier }${quotes}`} ${context.sign} ${SQLLiteral.convert(node.value, node.raw)})`;
        }
      }
    } else {
      const temp = context.literal = node.value == "Edm.Boolean" ? node.raw : SQLLiteral.convert(node.value, node.raw);
      if (this.where.includes("@EXPRESSION@")) this.where = this.where.replace("@EXPRESSION@", temp); 
      else if (this.where.includes("@EXPRESSIONSTRING@")) this.where = this.where.replace("@EXPRESSIONSTRING@", `${temp} ${context.sign}`);       
      else this.where += temp;
      
    }
  }

  protected VisitInExpression(node: Token, context: IodataContext): void {
    this.Visit(node.value.left, context);
    this.where += " IN (";
    this.Visit(node.value.right, context);
    this.where += ":list)";
  }

  protected VisitArrayOrObject(node: Token, context: IodataContext): void {
    this.where += context.literal = SQLLiteral.convert(node.value, node.raw);
  }

  protected createGeoColumn(entity: string | Ientity, column: string): string {    
    column = removeAllQuotes(column);
    let test: string | undefined = undefined;
    const tempEntity: Ientity = (typeof entity === "string") ? this.ctx.model[entity] : entity ;
    if (column.includes("/")) {
      const temp = column.split("/");
      if (tempEntity.relations.hasOwnProperty(temp[0])) {
        const rel = tempEntity.relations[temp[0]];
        column = `(SELECT ${addDoubleQuotes(temp[1])} FROM ${addDoubleQuotes(rel.tableName)} WHERE ${rel.expand} AND length(${addDoubleQuotes(temp[1])}::text) > 2)`;
        test = this.ctx.model[rel.entityName].columns[temp[1]].test;
        if (test)  test = `(SELECT ${addDoubleQuotes(test)} FROM ${addDoubleQuotes(rel.tableName)} WHERE ${rel.expand})`;
      }
    } else if (!tempEntity.columns.hasOwnProperty(column)) {
      if (tempEntity.relations.hasOwnProperty(column)) {
        const rel = tempEntity.relations[column];
        column = `(SELECT ${addDoubleQuotes(rel.entityColumn)} FROM ${addDoubleQuotes(rel.tableName)} WHERE ${rel.expand} AND length(${addDoubleQuotes(rel.entityColumn)}::text) > 2)`;
        test = this.ctx.model[rel.entityName].columns[rel.entityColumn].test;
      } else throw new Error(`Invalid column ${column}`);
    } else {      
      // TODO ADD addDoubleQuotes
      test = `"${tempEntity.columns[column].test}"`;
      column = addDoubleQuotes(column);
    }
    if (test)
      column = `CASE WHEN ${test} LIKE '%geo+json' THEN ST_GeomFromEWKT(ST_GeomFromGeoJSON(coalesce(${column}->'geometry',${column}))) ELSE ST_GeomFromEWKT(${column}::text) END`;
    return column;
  }
  
  protected VisitMethodCallExpression(node: Token, context: IodataContext) {
    const method = node.value.method;
    const params = node.value.parameters || [];

    const isColumn = (input: number | string): string | undefined => {
      const entity: Ientity = this.ctx.model[this.entity];
      const column = typeof input === "string" ? input : decodeURIComponent( Literal.convert(params[input].value, params[input].raw) );

      if (column.includes("/")) {
        const temp = column.split("/");
        if (entity.relations.hasOwnProperty(temp[0])) 
          return this.ctx.model[entity.relations[temp[0]].entityName].columns[temp[1]].test;
      } 
      else if (entity.columns.hasOwnProperty(column)) 
        return column;
      else if (entity.relations.hasOwnProperty(column)) 
        return this.ctx.model[entity.relations[column].entityName].columns[entity.relations[column].entityColumn].test;
    }

    const columnOrData = (index: number, operation: string, ForceString: boolean): string => {
      const test = decodeURIComponent( Literal.convert(params[index].value, params[index].raw) );
      if (test === "result") return this.getColumnResult(context, operation, ForceString);
      const column =  isColumn(test);       
      // return `${operation.trim() != "" ? `${operation}(` : '' } ${column ? addDoubleQuotes(column) : addSimpleQuotes(geoColumnOrData(index, false))}${operation.trim() != "" ? ")" : "" }`;
      return column ? addDoubleQuotes(column) : addSimpleQuotes(geoColumnOrData(index, false));

    };

    const geoColumnOrData = (index: number, srid: boolean): string => {
      const temp = decodeURIComponent(
        Literal.convert(params[index].value, params[index].raw)
      ).replace("geography", "");
      return this.ctx.model[this.entity].columns[temp]
        ? temp
        : `${srid === true ? "SRID=4326;" : ""}${removeAllQuotes(temp)}`;
    };

    const cleanData = (index: number): string =>
      params[index].value == "Edm.String"
        ? removeAllQuotes(Literal.convert(params[index].value, params[index].raw))
        : Literal.convert(params[index].value, params[index].raw);

    const order = params.length === 2 ? isColumn(0) ? [0,1] : [1,0] : [0];
    switch (method) {
      case "contains":
        this.Visit(params[0], context);
        this.where += ` ~* '${SQLLiteral.convert( params[1].value, params[1].raw ).slice(1, -1)}'`;
        break;
      case "containsAny":
        this.where += "array_to_string(";
        this.Visit(params[0], context);
        this.where += `, ' ') ~* '${SQLLiteral.convert( params[1].value, params[1].raw ).slice(1, -1)}'`;
        break;
      case "endswith":
        this.where += `${columnOrData(0, "", true)}  ILIKE '%${cleanData(1)}'`;
        break;
      case "startswith":
        this.where += `${columnOrData(0, "", true)} ILIKE '${cleanData(1)}%'`;
        break;
      case "substring":
        this.where += (params.length == 3) 
            ? ` SUBSTR(${columnOrData(0, "", true)}, ${cleanData( 1 )} + 1, ${cleanData(2)})`
            : this.where += ` SUBSTR(${columnOrData(0, "", true)}, ${cleanData(1)} + 1)`;
        break;
      case "substringof":
        this.where += `${columnOrData(0, "", true)} ILIKE '%${cleanData(1)}%'`;
        break;
      case "indexof":
        this.where += ` POSITION('${cleanData(1)}' IN ${columnOrData(0, "", true)})`;
        break;
      case "concat":
        this.where += `(${columnOrData(0, "concat", true)} || '${cleanData(1)}')`;
        break;
      case "length":
        // possibilty calc length string of each result or result 
        this.where += (decodeURIComponent( Literal.convert(params[0].value, params[0].raw) ) === "result") 
        ? `${columnOrData(0, "CHAR_LENGTH", true)}`
        :  `CHAR_LENGTH(${columnOrData(0, "CHAR_LENGTH", true)})`;
        break;
      case "tolower":
        this.where += `LOWER(${columnOrData(0, "", true)})`;
        break;
      case "toupper":
        this.where += `UPPER(${columnOrData(0, "", true)})`;
        break;
      case "year":
      case "month":
      case "day":
      case "hour":
      case "minute":
      case "second":
        this.where += `EXTRACT(${method.toUpperCase()} FROM ${columnOrData( 0, "", false )})`;
        break;
      case "round":
      case "floor":
      case "ceiling":
        this.where += columnOrData(0, method.toUpperCase(),false);
        break;
      case "now":
        this.where += "NOW()";
        break;
      case "date":
        this.where += `${method.toUpperCase()}(`;
        this.Visit(params[0], context);
        this.where += ")";
        break;
      case "time":
        this.where += `(${columnOrData(0, "", true)})::time`;
        break;
        case "geo.distance":
          case "geo.contains":
          case "geo.crosses":
          case "geo.disjoint":
          case "geo.equals":
          case "geo.overlaps":
          case "geo.relate":
          case "geo.touches":
          case "geo.within":
            this.where += `${method .toUpperCase() .replace("GEO.", "ST_")}(${this.createGeoColumn(this.entity, columnOrData(order[0], "", true) )}), ${columnOrData(order[1], "", true)}')`;
            break;
          case "geo.length":
            this.where += `ST_Length(ST_MakeLine(ST_AsText(${this.createGeoColumn(this.entity, columnOrData(order[0], "", true) )}), ${columnOrData(order[1], "", true)}'))`;
            break;
          case "geo.intersects":        
            this.where += `st_intersects(ST_AsText(${this.createGeoColumn(this.entity, columnOrData(order[0], "", true) )}), ${columnOrData(order[1], "", true)})`;
            break;
          case "trim":
            this.where += `TRIM(BOTH '${ params.length == 2 ? cleanData(1) : " " }' FROM ${columnOrData(0, "", true)})`;
            break;
          case "mindatetime":
            this.where += `MIN(${this.where.split('" ')[0]}")`;
            break;
    }
  }
}
