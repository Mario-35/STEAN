import { keyobj } from "../../types";

export function logToHtml(input: string): string {
  const EnumHtmlColor: { [key: number]: string; } = {
      30 : "000000",
      31 : "FF0000",
      32 : "16A085",
      33 : "F3EF12",
      34 : "0000FF", 
      35 : "FF00FF",
      36 : "0000FF",
      37 : "000000",
      39 : "FFFFFF",
      90 : "BDC3C7",
    }

    Object.keys(EnumHtmlColor).forEach((key) => {       
      input = input.split(`[${key}m`).join(`</span><span style="color:#${EnumHtmlColor[key as keyobj]}"> `);
    });    
    input = input.split('/r/n').join(`<br />`).split('/r').join(`<br />`);
    return input.split(`[0m`).join(`<br />`);
    
  }