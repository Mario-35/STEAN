function isSubquery(str: string, parenthesisLevel: number): number {
    return  parenthesisLevel - (str.replace(/\(/g,'').length - str.replace(/\)/g,'').length );
}
  
function split_sql(str: any, tab :number): string {
    const sp = "  ";
    return str.replace(/\s{1,}/g," ")
        .replace(/ AND /ig,"~::~"+sp.repeat(tab * 2)+"AND ")
        .replace(/ BETWEEN /ig,"~::~"+sp.repeat(tab)+"BETWEEN ")
        .replace(/ CASE /ig,"~::~"+sp.repeat(tab)+"CASE ")
        .replace(/ ELSE /ig,"~::~"+sp.repeat(tab)+"ELSE ")
        .replace(/ END /ig,"~::~"+sp.repeat(tab)+"END ")
        .replace(/ FROM /ig,"~::~FROM ")
        .replace(/ GROUP\s{1,}BY/ig,"~::~GROUP BY ")
        .replace(/ HAVING /ig,"~::~HAVING ")
        .replace(/ IN /ig,"~::~"+sp.repeat(tab)+"IN ")
        // .replace(/ IN /ig," IN ")
        .replace(/ JOIN /ig,"~::~JOIN ")
        .replace(/ CROSS~::~{1,}JOIN /ig,"~::~CROSS JOIN ")
        .replace(/ INNER~::~{1,}JOIN /ig,"~::~INNER JOIN ")
        .replace(/ LEFT~::~{1,}JOIN /ig,"~::~LEFT JOIN ")
        .replace(/ RIGHT~::~{1,}JOIN /ig,"~::~RIGHT JOIN ")
        .replace(/ ON /ig,"~::~"+sp.repeat(tab)+"ON ")
        .replace(/ OR /ig,"~::~"+sp.repeat(tab * 2)+"OR ")
        .replace(/ ORDER\s{1,}BY/ig,"~::~ORDER BY ")
        .replace(/ OVER /ig,"~::~"+sp.repeat(tab)+"OVER ")
        // .replace(/\(\s{0,}SELECT /ig,"~::~(SELECT ")
        .replace(/ THEN /ig," THEN~::~"+sp.repeat(tab)+"")
        .replace(/ UNION /ig,"~::~UNION~::~")
        .replace(/ USING /ig,"~::~USING ")
        .replace(/ WHEN /ig,"~::~"+sp.repeat(tab)+"WHEN ")
        .replace(/ WHERE /ig,"~::~WHERE ")
        .replace(/ WITH /ig,"~::~WITH ")
        // .replace(/\,\s{0,}\(/ig,",~::~( ")
        .replace(/\, /ig,",~::~"+sp.repeat(tab * 2)+"")
        .replace(/ ALL /ig," ALL ")
        .replace(/ AS /ig," AS ")
        .replace(/ ASC /ig," ASC ")
        .replace(/ DESC /ig," DESC ")
        .replace(/ DISTINCT /ig," DISTINCT ")
        .replace(/ EXISTS /ig," EXISTS ")
        .replace(/ NOT /ig," NOT ")
        .replace(/ NULL /ig," NULL ")
        .replace(/ LIKE /ig," LIKE ")
        .replace(/\s{0,}CONCAT /ig,"CONCAT ")
        .replace(/\s{0,}SELECT /ig,"SELECT ")
        .replace(/~::~{1,}/g,"~::~")
        .split('~::~');
    }
    
    export function parseSql(text: string):string {
    const shift = ['\n']; // array of shifts
    const step = '  '; // 2 spaces
    let ix = 0;
    
        // initialize array with shifts; nesting level == 100 //
    for(ix=0;ix<100;ix++){
        shift.push(shift[ix]+step);
    }
    
  
    const ar_by_quote = text.replace(/\s{1,}/g," ")
                        .replace(/\'/ig,"~::~\'")
                        .split('~::~');
                        let len = ar_by_quote.length;

    let ar:string[] = [];
    let deep = 0;
    let tab = 0;
    let parenthesisLevel = 0;
    let str = '';
  
      for(ix=0; ix<len; ix++) {
  
          if(ix%2) {
              ar = ar.concat(ar_by_quote[ix]);
          } else {
              ar = ar.concat(split_sql(ar_by_quote[ix], tab));
          }
      }
  
      len = ar.length;
      for(ix=0;ix<len;ix++) {
  
          parenthesisLevel = isSubquery(ar[ix], parenthesisLevel);
  
          if( /\s{0,}\s{0,}SELECT\s{0,}/.exec(ar[ix]))  {
              ar[ix] = ar[ix].replace(/\,/g,",\n"+"  ".repeat(tab)+"");
          }
  
          if( /\s{0,}\(\s{0,}SELECT\s{0,}/.exec(ar[ix]))  {
              deep++;
              str += shift[deep]+ar[ix];
          } else
          if( /\'/.exec(ar[ix]) )  {
              if(parenthesisLevel<1 && deep) {
                  deep--;
              }
              str += ar[ix];
          }
          else  {
              str += shift[deep]+ar[ix];
              if(parenthesisLevel<1 && deep) {
                  deep--;
              }
          }
      }
      return str.replace(/^\n{1,}/,'').replace(/\n{1,}/g,"\n");
  };