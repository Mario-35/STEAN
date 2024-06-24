import { keyobj } from "../../types";

export function logToHtml(input: string): string {
  const EnumHtmlColor: { [key: number]: string; } = {
      30 : "000000",
      31 : "FF0000",
      32 : "00FF00",
      33 : "FFFF00",
      34 : "0000FF", 
      35 : "FF00FF",
      36 : "00FFFF",
      37 : "FFFFFF",
      39 : "FFFFFF"
    }
    Object.keys(EnumHtmlColor).forEach((key) => {       
      input = input.split(`[${key}m`).join(`</span><span style="color:#${EnumHtmlColor[key as keyobj]}"> `)
    }); 
    return input
              .split(`[0m`)
              .join(``)
              .split(/\r?\n/)
              .map((e: string) => e.trim().startsWith("</span>") ? e: `<span style="color:#93C572">${e}`)
              .join("</span><br />");
    
  }