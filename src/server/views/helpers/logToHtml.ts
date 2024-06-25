import { _ARROWLEFT, _ARROWRIGHT } from "../../constants";
import { keyobj } from "../../types";

export function logToHtml(input: string): string {
  const pipo = (input: string) => {
   const tmp =  input.split("</span>")
    tmp.slice(1);
    return tmp.filter(e => e.trim() != "").join("</span>");
  }
  const EnumHtmlColor: { [key: number]: string; } = {
    30 : "000000", // Black
    31 : "FF0000", // Red
    32 : "00FF00", // Green
    33 : "FFFF00", // Yellow
    34 : "0000FF", // Blue
    35 : "FF00FF", // Magenta
    36 : "00FFFF", // Cyan
    37 : "FFFFFF", // White
    39 : "FFFFFF", // White
    90 : "DBA57D",  // Orange
    92 : "BBFFBB",  // Orange
    93 : "DB61D9",  // Orange
    95 : "DB61D9"  // Orange
    } // BBFFBB
    input = input.split(`[92m[93m`).join("</pre></span>").split(`[92m`).join(`<span style="color:#93C572"><pre>`);
    Object.keys(EnumHtmlColor).forEach((key) => {       
      input = input.split(`[${key}m`).join(`</span><span style="color:#${EnumHtmlColor[key as keyobj]}"> `)
    }); 
    return input
              .split(`[0m`)
              .join(``)
              .split(`[1m`)
              .join(`<span style="font-weight:bold;">`)
              .split(`[22m`)
              .join(`</span>`)
              .split("<--")
              .join(_ARROWLEFT)
              .split("-->")
              .join(_ARROWRIGHT)
              .split(/\r?\n/)
              .map((e: string) => e.trim().startsWith("</span>") ? `${pipo(e)}</span><br />\r`: `${e}\r`)
              .join("");
    
  }