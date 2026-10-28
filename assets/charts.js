"use strict";
(() => {
  const d = window.RESEARCH_DATA;
  const primary = "#94070A", ochre = "#b47a46";
  const fmt = value => Number(value).toFixed(2);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function lineChart(labels, lines, title) {
    const W=720,H=310,L=47,R=17,T=20,B=40;
    const x=i=>L+i*(W-L-R)/(labels.length-1),y=v=>H-B-v*(H-T-B)/100;
    let out=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>`;
    for(let value=0;value<=100;value+=25) out+=`<line x1="${L}" y1="${y(value)}" x2="${W-R}" y2="${y(value)}" stroke="#ece7e7"/><text x="${L-8}" y="${y(value)+4}" text-anchor="end">${value}%</text>`;
    const ticks = labels.length>20 ? [0,8,16,24,labels.length-1] : [0,4,8,12,labels.length-1];
    for(const i of ticks) out+=`<text x="${x(i)}" y="${H-12}" text-anchor="${i===0?'start':i===labels.length-1?'end':'middle'}">${esc(labels[i])}</text>`;
    for(const line of lines) {
      let path="",active=false;
      line.values.forEach((value,i)=>{if(value===null){active=false;return;}path+=`${active?'L':'M'}${x(i)},${y(value)} `;active=true;});
      out+=`<path d="${path}" fill="none" stroke="${line.color}" stroke-width="2.5"/>`;
      line.values.forEach((value,i)=>{if(value!==null)out+=`<circle cx="${x(i)}" cy="${y(value)}" r="3" fill="${line.color}"><title>${esc(line.name)} · ${esc(labels[i])}：${fmt(value)}%</title></circle>`;});
    }
    return out+"</svg>";
  }
  function cohortChart(cohort) {
    const lines=[];
    if(cohort!=="balanced") lines.push({name:"当季全样本",values:d.cohort.all,color:primary});
    if(cohort!=="all") lines.push({name:"固定51药",values:d.cohort.balanced,color:ochre});
    document.querySelector("#cohort-chart").innerHTML=lineChart(d.cohort.quarters,lines,"全样本与固定51药的季度金额份额中位数");
    const first=d.cohort.quarters.indexOf("2021Q1"),last=d.cohort.quarters.length-1;
    const all=`当季全样本 ${fmt(d.cohort.all[first])}% → ${fmt(d.cohort.all[last])}%`;
    const balanced=`固定51药 ${fmt(d.cohort.balanced[first])}% → ${fmt(d.cohort.balanced[last])}%`;
    document.querySelector("#cohort-summary").textContent="2021Q1 至 2024Q4："+(cohort==="all"?all:cohort==="balanced"?balanced:all+"；"+balanced)+"。";
    document.querySelectorAll("[data-cohort]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.cohort===cohort)));
    const legend=document.querySelector("#cohort-chart").previousElementSibling;
    legend.children[0].hidden=cohort==="balanced";legend.children[1].hidden=cohort==="all";
  }
  function drugChart() {
    const name=document.querySelector("#drug-select").value,values=d.cases.values[name];
    document.querySelector("#drug-chart").innerHTML=lineChart(d.cases.quarters,[{name,values,color:primary}],name+"的季度仿制药金额份额");
    document.querySelector("#drug-summary").textContent=`${name.replace(" ","")}：${fmt(values[0])}% → ${fmt(values.at(-1))}%，累计增加 ${fmt(values.at(-1)-values[0])} 个百分点。`;
  }
  function modelChart(metric) {
    const values=d.models.map(row=>row[metric]),best=Math.min(...values),W=720,H=225,L=150,R=65,T=18;
    let out=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="2024年测试${metric.toUpperCase()}比较，单位为百分点"><title>2024年测试${metric.toUpperCase()}，数值越小误差越低</title>`;
    d.models.forEach((row,i)=>{
      const y=T+i*65,width=values[i]/8*(W-L-R);
      out+=`<text x="0" y="${y+25}" style="font-size:15px">${esc(row.name)}</text><rect x="${L}" y="${y}" width="${width}" height="37" rx="2" fill="${values[i]===best?primary:'#c9bdbd'}"/><text x="${L+width+10}" y="${y+25}" style="font-size:15px">${fmt(values[i])}</text>`;
    });
    document.querySelector("#model-chart").innerHTML=out+"</svg>";
    document.querySelector("#model-summary").textContent=metric==="mae"?"前值基准：MAE＝3.55 个百分点。":"岭回归：RMSE＝6.48 个百分点。";
    document.querySelectorAll("[data-metric]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.metric===metric)));
  }
  document.querySelectorAll("[data-cohort]").forEach(b=>b.addEventListener("click",()=>cohortChart(b.dataset.cohort)));
  document.querySelectorAll("[data-metric]").forEach(b=>b.addEventListener("click",()=>modelChart(b.dataset.metric)));
  document.querySelector("#drug-select").addEventListener("change",drugChart);
  cohortChart("both");drugChart();modelChart("mae");
})();
