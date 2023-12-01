/**
 * pgVisitor for odata.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { getColumnResult, getColumnNameOrAlias, _DB } from "../../db/constants";
import { isGraph, isObservation, isTest, removeQuotes, returnFormats } from "../../helpers";
import { IodataContext, IKeyString, IreturnFormat, Ientity, IcolumnOption, IKeyBoolean } from "../../types";
import { Token } from "../parser/lexer";
import { Literal } from "../parser/literal";
import { SQLLiteral } from "../parser/sqlLiteral";
import { SqlOptions } from "../parser/sqlOptions";
import koa from "koa";
import { Logs } from "../../logger";
import { createGetSql, createPostSql, oDatatoDate } from "./helper";
import { errors, msg } from "../../messages/";
import { EcolType, EextensionsType } from "../../enums";
import { getEntity, getEntityName, getRelationColumnTable, isColumnType } from "../../db/helpers";

export class PgVisitor {
  public options: SqlOptions;
  // main entity
  public entity = "";
  // parent entity
  parentEntity: string | undefined = undefined;
  extras: undefined;
  relation: string | undefined = undefined;
  idLog: bigint | string = BigInt(0);
  id: bigint | string = BigInt(0);
  parentId: bigint | string = BigInt(0);
  select = "";
  arrayNames: IKeyString = {};
  where = "";
  orderby = "";
  blanks: string[] | undefined = undefined;
  groupBy: string[] = [];
  expand: string[] = [];
  splitResult: string[] | undefined;
  interval: string | undefined;
  payload: string | undefined;
  skip = 0;
  limit = 0;
  count = false;
  valuesKeys = false;
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
  public configName: string;
  results: IKeyString = {};
  sql = "";
  debugOdata = isTest() ? false : false;
  constructor(options = <SqlOptions>{}) {
    this.options = options;
    this.onlyRef = options.onlyRef;
    this.onlyValue = options.onlyValue;
    if (this.onlyValue === true) this.resultFormat = returnFormats.txt;
  }

  // ***********************************************************************************************************************************************************************
  // ***                                                           ROSSOURCES                                                                                            ***
  // ***********************************************************************************************************************************************************************
  public setEntity(input: string) {
    this.entity = input;
  }
  public getEntity() {
    return this.entity;
  }
  public noLimit() {
    this.limit = 0;
    this.skip = 0;
  }

  addToArrayNames(key: string, value?: string) {
    this.arrayNames[key] = value ? value : `${key}`;
  }

  addToBlanks(input: string) {
    // TODO test with create    
    if (input.endsWith('Time"')) input = `step AS ${input}`;
    else if (input === '"@iot.id"') input = `coalesce("@iot.id", 0) AS "@iot.id"`;
    else if (input.startsWith("CONCAT")) input = `${input}`;
    else if (input[0] !== "'") input = `${input}`;
    if (this.blanks) this.blanks.push(input); else this.blanks = [input];
  }

  protected getGoodColumnAlias(input: string, context: IodataContext ) {
    const tempEntity = getEntity(this.entity || this.parentEntity || this.navigationProperty);    
    const options: IcolumnOption = {table: false, as: false, cast: false, numeric: this.numeric, test: this.createOptions()};
    const temp = input === "result" ? getColumnResult(true, this.isSelect(context)) : tempEntity ? getColumnNameOrAlias(tempEntity, input, options) : undefined;
    if (temp) return temp;
    if (this.isSelect(context) && tempEntity && tempEntity.relations[input]) {
      const entity = getEntityName(input);       
      return tempEntity && entity ? `CONCAT('${this.options.rootBase}${tempEntity.name}(', "${tempEntity.table}"."id", ')/${_DB[entity].name}') AS "${_DB[entity].name}@iot.navigationLink"` : undefined;    
    }   
  }


  init(ctx: koa.Context, node: Token) {
    Logs.head("INIT PgVisitor");
    this.limit = ctx._config.nb_page || 200;
    this.configName = ctx._config.name;
    this.numeric = ctx._config.extensions.includes(EextensionsType.numeric);
    const temp = this.VisitRessources(node);
    this.verifyRessources();
    return temp;
  }

  verifyRessources = (): void => {
    Logs.head("verifyRessources");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  VisitRessources(node: Token, context?: IodataContext) {
    const ressource = this[`VisitRessources${node.type}`];
    if (ressource) {
      ressource.call(this, node, context);
      Logs.debug("VisitRessources",`VisitRessources${node.type}`, this.debugOdata);
      Logs.result("node.raw", node.raw, this.debugOdata);
    } else {
      Logs.error( `Ressource Not Found ============> VisitRessources${node.type}` );
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitRessourcesEntitySetName(node: Token, context: IodataContext) {
    this.entity = node.value.raw;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitRessourcesRefExpression(node: Token, context: IodataContext) {
    if (node.type == "RefExpression" && node.raw == "/$ref")
      this.onlyRef = true;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitRessourcesValueExpression(node: Token, context: IodataContext) {
    if (node.type == "ValueExpression" && node.raw == "/$value")
      this.onlyValue = true;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitRessourcesCollectionNavigation(node: Token, context: IodataContext) {
    if (node.value.path) this.VisitRessources(node.value.path, context);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitRessourcesCollectionNavigationPath(node: Token, context: IodataContext) {
    if (node.value.predicate)
      this.VisitRessources(node.value.predicate, context);
    if (node.value.navigation)
      this.VisitRessources(node.value.navigation, context);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitRessourcesSimpleKey(node: Token, context: IodataContext) {
    if (node.value.value.type === "KeyPropertyValue")
      this.VisitRessources(node.value.value, context);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitRessourcesKeyPropertyValue(node: Token, context: IodataContext) {
    this.id = this.options.loraId
      ? this.options.loraId
      : this.options.name
      ? this.options.name
      : node.value == "Edm.SByte"
      ? BigInt(node.raw)
      : node.raw;

      
    this.where = this.options.loraId
      ? `"lora"."deveui" = '${this.options.loraId}'`
      : `id = ${this.id}`;
  }

  protected VisitRessourcesSingleNavigation(node: Token, context: IodataContext) {
    if (node.value.path && node.value.path.type === "PropertyPath")
      this.VisitRessources(node.value.path, context);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitRessourcesPropertyPath(node: Token, context: IodataContext) {
    let tempNode = node;
    if (node.type == "PropertyPath") {
      if (getRelationColumnTable(this.entity, node.value.path.raw) === EcolType.Relation) {
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
        // const inOrEqual = BigInt(this.id) > 0 ? "=" : "in";
        const tmpLink = _DB[this.entity].relations[node.value.path.raw].link
          .split("$ID")
          .join(<string>this.parentId);
        const tmpLinkSplit = tmpLink.split("in (");
        if (BigInt(this.id) > 0) {
          this.where = `${tmpLinkSplit[0]} = (SELECT id FROM (${tmpLinkSplit[1]} as l WHERE id = ${this.id})`;
        } else this.where = tmpLink;
        this.parentEntity = this.entity;
        this.entity = node.value.path.raw;
      } else if (_DB[this.entity].columns[node.value.path.raw]) {
        this.select = node.value.path.raw;
        this.showRelations = false;
      } else this.entity = node.value.path.raw;
    }
  }

  protected VisitRessourcesODataUri(node: Token, context: IodataContext) {
    this.VisitRessources(node.value.resource, context);
    this.VisitRessources(node.value.query, context);
  }

  asGetSql(): string {
    try {
      return createGetSql(this);
    } catch (error) {
      return "";
    }
  }

  asPatchSql(datas: object, configName: string): string {
    try {
      return createPostSql(datas, configName, this);
    } catch (error) {
      return "";
    }
  }

  asPostSql(datas: object, configName: string): string {
    try {
      return createPostSql(datas, configName, this);
    } catch (error) {
      return "";
    }
  }

  // ***********************************************************************************************************************************************************************
  // ***                                                              QUERY                                                                                              ***
  // ***********************************************************************************************************************************************************************

  start(ctx: koa.Context, node: Token) {
    Logs.head("Start PgVisitor");
    const temp = this.Visit(node);
    this.verifyQuery(ctx);    
    Logs.infos("PgVisitor", temp);
    return temp;
  }

  verifyQuery = (ctx: koa.Context): void => {
    Logs.head("verifyQuery");

    // if (this.select.length > 0) {
    //   const cols = [
    //     ...Object.keys(_DB[this.entity].columns),
    //     ...Object.keys(_DB[this.entity].relations),
    //   ];

      // this.select
      //   .split(",")
      //   .filter((e: string) => e.trim() != "")
      //   .forEach((element: string) => {
      //     const test = removeQuotes(element);
      //     if (!cols.includes(test) && test !== "result")
      //       ctx.throw(404, { detail: msg(errors.invalid, "name") + test });
      //   });
    // }
    const expands: string[] = [];
    this.includes.forEach((element: PgVisitor) => {
      if (element.ast.type === "ExpandItem")
        expands.push(element.ast.raw.split("(")[0]);
    });

    expands.forEach((elem: string) => {
      const elems = elem.split("/");
      elems.unshift(this.entity);
      if (elems[0]) {
        if (!Object.keys(_DB[elems[0]].relations).includes(elems[1]))
          ctx.throw(400, {
            detail: `Invalid expand path ${elems[1]} for ${elems[0]}`,
          });
      } else
        ctx.throw(400, { detail: msg(errors.invalid, "entity") + elems[0] });
    });

    if (isObservation(this.entity) === true && this.splitResult !== undefined && Number(this.parentId) == 0 ) {
      ctx.throw(400, { detail: errors.splitNotAllowed });
    }

    if ( this.resultFormat === returnFormats.dataArray && BigInt(this.id) > 0 && !this.parentEntity ) {
      ctx.throw(400, { detail: errors.dataArrayNotAllowed });
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
        Logs.debug("Visit",`Visit${node.type}`, this.debugOdata);
        Logs.result("node.raw", node.raw, this.debugOdata);
        Logs.result("this.where", this.where, this.debugOdata);   
        Logs.result("this.interval", this.interval, this.debugOdata);   
        Logs.debug("context", context, this.debugOdata);

      } else {
        Logs.error(`Node error =================> Visit${node.type}`);
        Logs.error(node);
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

  isWhere = (context: IodataContext): boolean => (context.target ? context.target === "where" : false);
  isSelect = (context: IodataContext): boolean => (context.target ? context.target === "select" : false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitExpand(node: Token, context: IodataContext) {
    node.value.items.forEach((item: Token) => {
      const expandPath = item.value.path.raw;
      let visitor = this.includes.filter( (v) => v.navigationProperty == expandPath )[0];
      if (!visitor) {
        visitor = new PgVisitor({ ...this.options });
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
    this.splitResult = removeQuotes(node.value).split(",");
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

  protected VisitresultFormat(node: Token, context: IodataContext) {
    this.Visit(node.value.path, context);
    if (node.value.options)
      node.value.options.forEach((item: Token) => this.Visit(item, context));
  }

  protected VisitDebug(node: Token, context: IodataContext) {
    this.Visit(node.value.path, context);
    if (node.value.options)
      node.value.options.forEach((item: Token) => this.Visit(item, context));
    // do Nothing
  }

  protected VisitRedo(node: Token, context: IodataContext) {
    this.Visit(node.value.path, context);
    if (node.value.options)
      node.value.options.forEach((item: Token) => this.Visit(item, context));
    // do Nothing
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitResultFormat(node: Token, context: IodataContext) {
    if (node.value.format) 
      this.resultFormat = returnFormats[node.value.format];
    if ( [ returnFormats.dataArray, returnFormats.graph, returnFormats.graphDatas, returnFormats.csv, ].includes(this.resultFormat) ) 
      this.noLimit();
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitExpandPath(node: Token, context: IodataContext) {
    this.navigationProperty = node.raw;
  }

  // Start loop process
  protected VisitQueryOptions(node: Token, context: IodataContext) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node.value.options.forEach((option: any) => this.Visit(option, context));
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitInlineCount(node: Token, context: IodataContext) {
    this.count = Literal.convert(node.value.value, node.value.raw);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitValuesKeys(node: Token, context: IodataContext) {
    this.valuesKeys = Literal.convert(node.value.value, node.value.raw);
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
    this.orderby += node.value.direction > 0 ? " ASC" : " DESC";
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitSkip(node: Token, context: IodataContext) {
    this.skip = +node.value.raw;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitTop(node: Token, context: IodataContext) {
    this.limit = +node.value.raw;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected VisitLog(node: Token, context: IodataContext) {
    this.idLog = node.value.raw;
  }

  protected VisitSelect(node: Token, context: IodataContext) {
    context.target = "select";
    node.value.items.forEach((item: Token) => {
      this.Visit(item, context);
    });
  }


  protected VisitSelectItem(node: Token, context: IodataContext) {
    const tempColumn = this.getGoodColumnAlias(node.raw, context); 
    
     
    context.identifier = tempColumn ? tempColumn : node.raw;
    if(context.target) 
      this[context.target] += tempColumn ? `${tempColumn},` : node.raw;
    this.showRelations = false;
  }

  protected VisitAndExpression(node: Token, context: IodataContext) {
    this.Visit(node.value.left, context);
    this.where += " AND ";
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
      if (getRelationColumnTable(_DB[this.entity], node.value.current.raw) === EcolType.Column
            && isColumnType(_DB[this.entity], node.value.current.raw, "json") 
            && node.value.next.raw[0] == "/" ) {
              this.where += `"${node.value.current.raw}"->>'${node.value.next.raw.slice(1)}'`;
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
    const addDate = this.addDateTypeToWhere(node, "<");
    if (addDate) this.where += addDate;
    else {
      this.Visit(node.value.left, context);
      this.where += " < ";
      this.Visit(node.value.right, context);
    }
  }

  protected VisitLesserOrEqualsExpression(node: Token, context: IodataContext) {
    const addDate = this.addDateTypeToWhere(node, "<=");
    if (addDate) this.where += addDate;
    else {
      this.Visit(node.value.left, context);
      this.where += " <= ";
      this.Visit(node.value.right, context);
    }
  }

  protected addDateTypeToWhere(node: Token, sign: string):string | undefined {
    if (getRelationColumnTable(_DB[this.entity], node.value.left.raw) === EcolType.Column && isColumnType(_DB[this.entity], node.value.left.raw, "date")) {
      const testIsDate = oDatatoDate(node, sign);
      const columnName = getColumnNameOrAlias(_DB[this.entity], node.value.left.raw, {table: true, as: true, cast: false, numeric: this.numeric, test: this.createOptions()});
      if (testIsDate) return `${columnName ? columnName : `"${node.value.left.raw}"`}${testIsDate}`;
    }
  }
  protected VisitGreaterThanExpression(node: Token, context: IodataContext) {
    const addDate = this.addDateTypeToWhere(node, ">");
    if (addDate) this.where += addDate;
    else {
      this.Visit(node.value.left, context);
      this.where += " > ";
      this.Visit(node.value.right, context);
    }
  }

  protected VisitGreaterOrEqualsExpression(node: Token, context: IodataContext) {
    const addDate = this.addDateTypeToWhere(node, ">=");
    if (addDate) this.where += addDate;
    else {
      this.Visit(node.value.left, context);
      this.where += " >= ";
      this.Visit(node.value.right, context);
    }
  }

  public parameterObject(): { [key: number]: unknown } {
    return Object.assign({}, this.parameters);
  }

  createOptions(): IKeyBoolean {
    return {
      valuesKeys: this.valuesKeys,
    };
  }

  public createComplexWhere(entity: string, node: Token, context: IodataContext) {
    if (context.target) {
      const tempEntity = getEntity(entity);
      if(!tempEntity) return;
      const colType = getRelationColumnTable(tempEntity, node.value.name);
      if (colType === EcolType.Column) { 
      
        if (context.relation) {
          if ( Object.keys(tempEntity.relations).includes(context.relation) ) {
            if (!context.key) {
              context.key = tempEntity.relations[context.relation].entityColumn; 
              this[context.target] += `"${context.key}"`;
            }
          }
        }
      } else if (colType === EcolType.Relation) {
        const tempEntity = getEntity(node.value.name);
        if (tempEntity) {
          if (context.relation) {
            context.sql = `"${_DB[entity].table}"."${_DB[entity].relations[node.value.name].entityColumn}" IN (SELECT "${tempEntity.table}"."${_DB[entity].relations[node.value.name].relationKey}" FROM "${tempEntity.table}"`;
          } else context.relation = node.value.name;
          if (!context.key) {
            context.key = _DB[entity].relations[context.relation].entityColumn; 
            this[context.target] = `"${ _DB[entity].relations[context.relation].entityColumn }"`;
          }
          return;
        }
      }
    }
  }

  
  protected VisitODataIdentifier(node: Token, context: IodataContext) {
    const alias = this.getGoodColumnAlias(node.value.name, context);
    node.value.name = alias ? alias : node.value.name;
    
    if (context.relation && context.identifier && isColumnType(_DB[context.relation], context.identifier.split(".")[0], "json")) {
      console.log("JE SUIS LA ATTENTION PAS EFFACER");
      
      context.identifier = `"${context.identifier.split(".")[0]}"->>'${node.value.name}'`;     
    } else {      
      if (this.isWhere(context)) this.createComplexWhere(context.identifier ? context.identifier.split(".")[0] : this.entity, node, context);
      if (!context.relation && !context.identifier && alias && context.target) {
        this[context.target] += alias;  
      } else {
        context.identifier = node.value.name;      
        if (context.target && !context.key) 
          this[context.target] += node.value.name.includes("->>") ||node.value.name.includes("->") || node.value.name.includes("::")
            ? node.value.name
            : this.entity && _DB[this.entity] ? `${getColumnNameOrAlias(_DB[this.entity], node.value.name, {table: false, as: false, cast: false, numeric: this.numeric, test: this.createOptions()})}` : node.value.name;
      }
    }    
  }
  
  protected VisitEqualsExpression(node: Token, context: IodataContext): void {
    const addDate = this.addDateTypeToWhere(node, "=");
    if (addDate) this.where += addDate;
    else {     
      this.Visit(node.value.left, context);
      this.where += " = ";
      this.Visit(node.value.right, context);
      this.where = this.where.replace(/= null/, "IS NULL");
    }
  }

  protected VisitNotEqualsExpression(node: Token, context: IodataContext): void {
    this.Visit(node.value.left, context);
    this.where += " <> ";
    this.Visit(node.value.right, context);
    this.where = this.where.replace(/<> null$/, "IS NOT NULL");
  }

  protected VisitLiteral(node: Token, context: IodataContext): void {    
    if (context.relation && this.isWhere(context)) {
      const temp = this.where.split(" ").filter(e => e != ""); 
      context.sign = temp.pop(); 
      this.where = temp.join(" ");
      
      this.where += ` IN (SELECT ${_DB[this.entity].relations[context.relation] ? `"${_DB[this.entity].relations[context.relation]["relationKey"]}"` : `"${_DB[context.relation].table}"."id"`} FROM "${ _DB[context.relation].table }" WHERE `;
      if (context.identifier) {
        if (context.identifier.startsWith("CASE") || context.identifier.startsWith("("))
          this.where += `${ context.identifier } ${context.sign} ${SQLLiteral.convert(node.value, node.raw)})`;
        else {
          const tempEntity = getEntity(context.relation);    

          const quotes = context.identifier[0] === '"' ? '' : '"';
          const alias = tempEntity ? getColumnNameOrAlias(tempEntity, context.identifier , {table: false, as: false, cast: false, numeric: this.numeric, test: this.createOptions()}) : undefined;

          this.where += (context.sql)
            ? `${context.sql} ${context.target} ${ context.identifier } ${context.sign} ${SQLLiteral.convert(node.value, node.raw)}))`
            : `${alias ? '' : `${_DB[context.relation].table}.`}${alias ? alias : `${quotes}${ context.identifier }${quotes}`} ${context.sign} ${SQLLiteral.convert(node.value, node.raw)})`;
        }
      }
    } else this.where += context.literal = node.value == "Edm.Boolean" ? node.raw : SQLLiteral.convert(node.value, node.raw);
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

  protected createColumn(entity: string, column: string): string {
    column = removeQuotes(column);
    let test: string | undefined = undefined;
    const tempEntity: Ientity = (typeof entity === "string") ? _DB[entity] : entity ;
    if (column.includes("/")) {
      const temp = column.split("/");
      if (tempEntity.relations.hasOwnProperty(temp[0])) {
        const rel = tempEntity.relations[temp[0]];
        column = `(SELECT "${temp[1]}" FROM "${rel.tableName}" WHERE ${rel.expand} AND length("${temp[1]}"::text) > 2)`;
        test = _DB[rel.entityName].columns[temp[1]].test;
        if (test)
          test = `(SELECT "${test}" FROM "${rel.tableName}" WHERE ${rel.expand})`;
      }
    } else if (!tempEntity.columns.hasOwnProperty(column)) {
      if (tempEntity.relations.hasOwnProperty(column)) {
        const rel = tempEntity.relations[column];
        column = `(SELECT "${rel.entityColumn}" FROM "${rel.tableName}" WHERE ${rel.expand} AND length("${rel.entityColumn}"::text) > 2)`;
        test = _DB[rel.entityName].columns[rel.entityColumn].test;
      } else throw new Error(`Invalid column ${column}`);
    } else {
      test = `"${tempEntity.columns[column].test}"`;
      column = `"${column}"`;
    }
    if (test)
      column = `CASE 
                  WHEN  ${test} = 'application/vnd.geo+json'
                  THEN ST_GeomFromEWKT(ST_GeomFromGeoJSON(${column}))
                  ELSE ST_GeomFromEWKT(${column}::text)
              END`;
    return column;
  }

  protected VisitMethodCallExpression(node: Token, context: IodataContext) {
    const method = node.value.method;
    const params = node.value.parameters || [];

    const columnOrData = (index: number, ForceString: boolean): string => {
      const temp = decodeURIComponent( Literal.convert(params[index].value, params[index].raw) );
      if (temp === "result") return getColumnResult(this.numeric, this.isSelect(context), ForceString === true ? 'text' : undefined);
      return _DB[this.entity].columns[temp] ? `"${temp}"` : `'${temp}'`;
    };

    const geoColumnOrData = (index: number, srid: boolean): string => {
      const temp = decodeURIComponent(
        Literal.convert(params[index].value, params[index].raw)
      ).replace("geography", "");
      return _DB[this.entity].columns[temp]
        ? temp
        : `${srid === true ? "SRID=4326;" : ""}${removeQuotes(temp)}`;
    };

    const cleanData = (index: number): string =>
      params[index].value == "Edm.String"
        ? removeQuotes(Literal.convert(params[index].value, params[index].raw))
        : Literal.convert(params[index].value, params[index].raw);

    switch (method) {
      case "contains":
        this.Visit(params[0], context);
        this.where += ` ~* '${SQLLiteral.convert(
          params[1].value,
          params[1].raw
        ).slice(1, -1)}'`;
        break;
      case "containsAny":
        this.where += "array_to_string(";
        this.Visit(params[0], context);
        this.where += ", ' ')";
        this.where += ` ~* '${SQLLiteral.convert(
          params[1].value,
          params[1].raw
        ).slice(1, -1)}'`;
        break;
      case "endswith":
        this.where += `${columnOrData(0, true)}  ILIKE '%${cleanData(1)}'`;
        break;
      case "startswith":
        this.where += `${columnOrData(0, true)} ILIKE '${cleanData(1)}%'`;
        break;
      case "substring":
        // if (params[0].value == "Edm.String" || params[0].type == "FirstMemberExpression") {
        if (params.length == 3)
          this.where += ` SUBSTR(${columnOrData(0, true)}, ${cleanData(
            1
          )} + 1, ${cleanData(2)})`;
        else this.where += ` SUBSTR(${columnOrData(0, true)}, ${cleanData(1)} + 1)`;
        break;
      case "substringof":
        this.where += `${columnOrData(0, true)} ILIKE '%${cleanData(1)}%'`;
        break;
      case "indexof":
        // if (params[0].value == "Edm.String" || params[0].type == "FirstMemberExpression") {
        this.where += ` POSITION('${cleanData(1)}' IN ${columnOrData(0, true)})`;
        break;
      case "concat":
        this.where += `(${columnOrData(0, true)} || '${cleanData(1)}')`;
        break;
      case "length":
        this.where += `CHAR_LENGTH(${columnOrData(0, true)})`;
        break;
      case "tolower":
        this.where += `LOWER(${columnOrData(0, true)})`;
        break;
      case "toupper":
        this.where += `UPPER(${columnOrData(0, true)})`;
        break;
      case "year":
      case "month":
      case "day":
      case "hour":
      case "minute":
      case "second":
        this.where += `EXTRACT(${method.toUpperCase()} FROM ${columnOrData(
          0, false
        )})`;
        break;
      case "round":
      case "floor":
      case "ceiling":
        this.where += `${method.toUpperCase()} (${columnOrData(0, false)})`;
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
        this.where += `(${columnOrData(0, true)})::time`;
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
        this.where += `${method
          .toUpperCase()
          .replace("GEO.", "ST_")}(${this.createColumn(_DB[this.entity],
          columnOrData(0, true)
        )}, '${geoColumnOrData(1, true)}')`;
        // this.where += `ST_Distance(${this.createColumn(columnOrData(0))}, '${geoColumnOrData(1, true)}')`;
        break;
      case "geo.length":
        this.where += `ST_Length(ST_MakeLine(ST_AsText(${this.createColumn(_DB[this.entity],
          columnOrData(0, true)
        )}), '${geoColumnOrData(1, false)}'))`;
        break;
      case "geo.intersects":
        this.where += `st_intersects(ST_AsText(${this.createColumn(_DB[this.entity],
          columnOrData(0, true)
        )}), '${geoColumnOrData(1, false)}')`;
        break;
      case "trim":
        this.where += `TRIM(BOTH '${
          params.length == 2 ? cleanData(1) : " "
        }' FROM ${columnOrData(0, true)})`;
        break;
      case "mindatetime":
        this.where += `MIN(${this.where.split('" ')[0]}")`;
        break;
    }
  }
}
