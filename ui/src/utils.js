/* global document */

export function stripHtml(html) {
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

export function truncate(string) {
  if (string.length > 140)
     return string.substring(0, 140)+ '...';
  else
     return string;
};