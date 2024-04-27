/**
 * decodedUrl interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export interface IdecodedUrl {
    linkbase:   string;
    root:       string;
    search:     string;
    path:       string;
    id:         bigint;
    idStr:      string | undefined;
    service:    string;
    version:    string;
    config:     string | undefined;
}