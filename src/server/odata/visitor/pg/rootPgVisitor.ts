/**
 * pgVisitor for odata
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- pgVisitor for odata -----------------------------------!");

import { addDoubleQuotes } from "../../../helpers";
import { IodataContext, IvisitRessource, keyobj, koaContext } from "../../../types";
import { Token } from "../../parser/lexer";
import { SqlOptions } from "../../parser/sqlOptions";
import { postSqlFromPgVisitor } from "../helper";
import { EColumnType, EExtensions } from "../../../enums";
import { models } from "../../../models";
import { log } from "../../../log";
import { _COLUMNSEPARATOR } from "../../../constants";
import { PgVisitor } from "../.";



export class RootPgVisitor extends PgVisitor {

  static root = true;
  constructor(ctx: koaContext, options = <SqlOptions>{}, node?: Token) {
      console.log(log.whereIam());
      super(ctx, options);
      if (node) this.StartVisitRessources(node);
  }

  protected verifyRessources = (): void => {
    console.log(log.head("verifyRessources"));
  };

  protected VisitRessources(node: Token, context?: IodataContext) {
    const ressource: IvisitRessource = this[`VisitRessources${node.type}` as keyobj];
    if (ressource) {
      ressource.call(this, node, context);
      if (this.debugOdata) {
        console.log(log.debug("VisitRessources",`VisitRessources${node.type}`));
        console.log(log.result("node.raw", node.raw));
      }
    } else {
      log.errorMsg(`Ressource Not Found ============> VisitRessources${node.type}`);
      throw new Error(`Unhandled node type: ${node.type}`);
    }
    return this;
  }

  protected VisitRessourcesResourcePath(node: Token, context?: IodataContext) {
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
    this.query.where.init(this.ctx.decodedUrl.idStr ? `"lora"."deveui" = '${this.ctx.decodedUrl.idStr}'` : `id = ${this.id}`);
  }

  protected VisitRessourcesSingleNavigation(node: Token, context: IodataContext) {
    if (node.value.path && node.value.path.type === "PropertyPath")
      this.VisitRessources(node.value.path, context);
  }
 
  protected VisitRessourcesPropertyPath(node: Token, context: IodataContext) {
    let tempNode = node;
    if (node.type == "PropertyPath") {
      if (models.getRelationColumnTable(this.ctx.config, this.entity, node.value.path.raw) === EColumnType.Relation) {
        this.parentId = this.id;
        this.id = BigInt(0);
        if ( node.value.navigation && node.value.navigation.type == "CollectionNavigation" ) {
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
          this.query.where.init(`${tmpLinkSplit[0]} = (SELECT id FROM (${tmpLinkSplit[1]} as l WHERE id = ${this.id})`);
        } else this.query.where.init(tmpLink);
        this.parentEntity = this.entity;
        this.entity = node.value.path.raw;
      } else if (this.ctx.model[this.entity].columns[node.value.path.raw]) {
        this.query.select.add(`${addDoubleQuotes(node.value.path.raw )}${_COLUMNSEPARATOR}`);
        this.showRelations = false;
      } else this.entity = node.value.path.raw;
    }
  }

  protected VisitRessourcesODataUri(node: Token, context: IodataContext) {
    this.VisitRessources(node.value.resource, context);
    this.VisitRessources(node.value.query, context);
  }

  StartVisitRessources(node: Token) {
    console.log(log.head("INIT PgVisitor"));
    this.limit = this.ctx.config.nb_page || 200;
    this.numeric = this.ctx.config.extensions.includes(EExtensions.resultNumeric);
    const temp = this.VisitRessources(node);
    this.verifyRessources();
    return temp;
  }

  getSql(): string {  
    if (this.includes) this.includes.forEach((include) => {
      if (include.navigationProperty.includes("/")) {              
        const names = include.navigationProperty.split("/");
        include.navigationProperty = names[0];
        const visitor = new PgVisitor(this.ctx, {...this.options});
        if (visitor) {
          visitor.entity =names[0];
          visitor.navigationProperty = names[1];
          if (include.includes) include.includes.push(visitor); else include.includes = [visitor];
        }            
      }
    });
    return this.onlyValue ? this.toString() : this.returnFormat.generateSql(this);
  }

  patchSql(datas: object): string | undefined {
    try {
      return postSqlFromPgVisitor(datas, this);
    } catch (error) {
      return undefined;
    }
  }

  postSql(datas: object): string | undefined {
    try {
      return postSqlFromPgVisitor(datas, this);
    } catch (error) {
      return undefined;
    }
  }

}