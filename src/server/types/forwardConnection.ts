/**
 * forwardConnection interface
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- forwardConnection interface -----------------------------------!");

export interface IforwardConnection {
    srcAddr: string; //The address or interface we want to listen on.
    srcPort: number ; // The port or interface we want to listen on.
    dstAddr: string; //The address we want to forward the traffic to.
    dstPort: number ; // The port we want to forward the traffic to.
}
