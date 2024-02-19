/**
 * decodedUrl interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export interface IdecodedUrl {
    protocol:   string;
    linkbase:   string;
    root:       string;
    model:      string;
    hostname:   string;
    hash:       string;
    search:     string;
    host:       string;
    pathname:   string;
    path:       string;
    id:         bigint;
    idStr:      string | undefined;
    href:       string;
    port:       string;
    username:   string;
    password:   string;
    service:    string;
    version:    string;
    config:     string | undefined;
}