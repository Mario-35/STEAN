const SplitterBar=function(n,t,e){const d=document.createElement("div"),o=document.createElement("div"),i=document.createElement("div");d.classList.add("leftSide"),o.classList.add("rightSide"),i.classList.add("splitter"),null!==t&&d.appendChild(t),null!==e&&o.appendChild(e),n.appendChild(i),i.style.width="5px",i.style.left="25%",i.style.transform="translateX(-25%)",i.style.background="black",d.style.left=0,d.style.top=0,d.style.width=i.offsetLeft-i.offsetWidth/2+"px",o.style.left=i.offsetLeft+i.offsetWidth/2+"px",o.style.top=0,o.style.width=n.offsetWidth-i.offsetLeft-5+"px",n.appendChild(d),n.appendChild(o);let l=!1,a=null,f,u=null;i.addEventListener("mousedown",function(t){t.preventDefault(),l=!0,a=t.offsetX,f=t.offsetY}),d.addEventListener("mousemove",function(t){t.preventDefault();var e=this.offsetLeft;u=e+t.offsetX-a}),o.addEventListener("mousemove",function(t){t.preventDefault();var e=this.offsetLeft;u=e+t.offsetX-a}),i.addEventListener("mousemove",function(t){t.preventDefault();var e=this.offsetLeft;u=e+t.offsetX-a}),document.body.addEventListener("mouseup",function(){l=!1}),document.addEventListener("mouseup",function(){l=!1}),document.addEventListener("mousemove",function(t){t.preventDefault(),t.stopPropagation();var e=n.getBoundingClientRect().width,f="HTML"==t.target.nodeName||"BODY"==t.target.nodeName;let s=t.offsetX-n.getBoundingClientRect().x-a;l&&(f?((s=s<0?0:s)+i.offsetWidth>n.offsetWidth&&(s=e-i.offsetWidth),i.style.left=s+"px"):((u=u+i.offsetWidth>e?e-i.offsetWidth:u)<0&&(u=0),i.style.left=u+"px"),d.style.width=i.offsetLeft-i.offsetWidth/2+"px",o.style.width=n.offsetWidth-d.offsetWidth-i.offsetWidth+"px",o.style.left=i.offsetLeft+i.offsetWidth/2+"px")}),window.addEventListener("mouseup",function(){l=!1})};