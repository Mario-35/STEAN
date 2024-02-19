/**
 * IserviceLink interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */


export interface IserviceLink {
    protocol: string;
    linkBase: string;
    version: string;
    root: string;
    model: string;
  }