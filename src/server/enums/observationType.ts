/**
 * observationType Enum.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export enum EobservationType {    
    "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_CategoryObservation" = "_resulttext",
    "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_CountObservation" = "_resultint",
    "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement" = "_resultnumber",
    "http://www.opengis.net/def/observation-type/ogc-om/2.0/om_complex-observation" ="_resultnumbers",
    "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Observation" = "any",
    "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_TruthObservation" = "_resultBoolean",
    "http://www.opengis.net/def/observation-type/ogc-omxml/2.0/swe-array-observation" = "_resulttexts"
}
