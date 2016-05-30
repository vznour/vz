MENU_TYPE={
    MODEL_ROOT:1,
    CATEGORY:2,
    SUBCATEGORY:3,
    URL_ROOT:4,
    DOMAIN:5,
    PAGE:6,
    BROWSER:7,
    OS:8,
    OS_ROOT:9,
    BROWSER_ROOT:10,
    ALL:100
  };

function parseDate(d){
          s= d.split('-');
          date = new Date(s[0],s[1]-1, s[2])
          return date;
        }
      
          // Set chart options
       


function combineDicts(src, dest){
  for( var k in src){
    if (src.hasOwnProperty(k))
      dest[k] = src[k];
  }
}

function getNodeForName(strNode, nodes){
  for ( var i=0;i< nodes.length;i++){
     var node= nodes[i];
     if (node.n==strNode){
       return node;
     }
   }
   return false;
 }

function hc(senti){
        if (senti >= 0.4)
          return 'positive';
        if (senti >= -0.4)
          return 'neutral';
        return 'negative';
       }

       function highlight_text(start, end, sentiment,txt){
        c = hc(sentiment);
        return  txt.slice(0,start)+'<span class="'+c+'">'+ txt.slice(start,end)+'</span>'+
                        txt.slice(end,txt.length);

       }

function getFormattedDoc(m){

   var d =  rawData[m.docid];
   var hdata = m.sents; 
   var unique=[];
   var text=d.v;
   	 //remove duplicates
   var hlen = hdata.length;
   for ( var i=0;i<hlen; i++){
       var ulen= unique.length;
       var add=true;
       for( var j=0; j<ulen; j++){
           if (unique[j][0]==hdata[i][0]){
              if ( unique[j][1] < hdata[i][1]){
                  var index = unique.indexOf(unique[j]);
                  unique.splice(index,1);
                  break;
            } else{
              add= false;
            }
           }
        }
        if(add==true)
          unique.push(hdata[i]);
    }
    //sort in descending using start index...
    unique.sort(function (a,b){ return b[0]-a[0];});
    //highlight text now according to sentiment...
    var prev=[[-1,-1]];
    var k=[];
    for( var l=0; l< unique.length;l++){
        k = unique[l];
        start = k[0];
        end = k[1];
        senti=k[2];
        if( end > prev[0])
          end = prev[0];
        if (end > text.length)
          end= text.length;
        prev =k;
        text =highlight_text(start,end,senti,text);
    }

    return{
    	'text': text, 'gid':d.g,'url':d.u,'sentiment':d.s,'rating':d.r,'os':d.o,'browser':d.b,'date':d.d,'ip':d.ip
    };
}

function getRawData(sentences){
	allResult=[];
	mapping={};
	for (var k in sentences){
		 if( sentences.hasOwnProperty(k)){
          mapping['docid']=k;
          mapping['sents']= sentences[k];
          var result = getFormattedDoc(mapping);
          allResult.push(result);
      }
	}

	return allResult;
}

function getRawDataForAll()
{
	return getRawData(allSentences);
}

function getRawDataForNode(node){
    return getRawData(modelSentences[node.i]);
}

function getRawData2(node, docs){
	docs = docs[node.i]
	allResult=[];
	var len =docs.length;
	mapping={};
	for (var i=0; i< len; i++){
		doc= docs[i];
		mapping['docid']=doc;
		mapping['sents']= allSentences[doc];
		var result = getFormattedDoc(mapping);
    allResult.push(result);
	}
	return allResult;
}

function getRawDataForURL(node){
  return getRawData2(node, urlDocs);
}
function getBrowserData(node){
  return getRawData2(node, browserDocs);
}

function getOSData(node){
  return getRawData2(node, OSDocs);
}


function getTrendData(node){
  var trend;
  var cTrend=[];
  switch(node.t){
    case MENU_TYPE.MODEL_ROOT:
      trend =allTrend; cTrend=modelTrend;
      break;
    case MENU_TYPE.CATEGORY:
      trend = modelTrend[node.i]; cTrend=modelTrend;
      break;
    case MENU_TYPE.SUBCATEGORY:
        trend = modelTrend[node.i];
        break;
    case MENU_TYPE.URL_ROOT:
        trend = allTrend;cTrend=urlTrend;
        break;
    case MENU_TYPE.DOMAIN:
        trend = urlTrend[node.i];cTrend=urlTrend;
        break;
    case MENU_TYPE.PAGE:
        trend = urlTrend[node.i];
        break;
    case MENU_TYPE.BROWSER_ROOT:
        trend = allTrend;cTrend=browserTrend;
        break;
    case MENU_TYPE.BROWSER:
        trend = browserTrend[node.i];
        break;
    case MENU_TYPE.OS_ROOT:
        trend = allTrend;cTrend=OSTrend;
        break;
    case MENU_TYPE.OS:
        trend =OSTrend[node.i];
        break;
  }
  return [trend,cTrend];
}

function getTrend(node){

  var c =node.c;
  var volume ={};
//  var sentiment={};
  var rating={};
  var cols ={};

  var trend=allTrend;
  var cTrend =[];
  
  var data = getTrendData(node);
  trend=data[0];
  cTrend=data[1];
  
  var clen=0;
  if ( c)
    clen= c.length;
  var tlen=trend.length;


if ( clen >0){
    volume[node.n]={type: "bar",values:[],key:'Total' ,yAxis: 1};
    rating[node.n]={type: "bar",values:[],key:'Average Rating',yAxis: 1};
  for(var k=0; k< clen; k++){
    volume[c[k].n]={type: "line",values:[],key:c[k].n,yAxis: 1};
    rating[c[k].n]={type: "line",values:[],key:c[k].n,yAxis: 1};
  }
}
else{
    volume[node.n]={type: "bar",values:[],key:'Total' ,yAxis: 1};
    rating[node.n]={type: "bar",values:[],key:'Average Rating',yAxis: 1};
}

   for( var i=0; i < tlen;i++){
      var d = parseDate(trend[i][0])
      volume[node.n].values.push([d,trend[i][1]]);
      rating[node.n].values.push([d,trend[i][2]]);
      if ( clen > 0){
        for (var j=0; j< clen; j++){
          var v=cTrend[c[j].i][i][1];
          var r =cTrend[c[j].i][i][2];
          volume[c[j].n].values.push([d,v]);
          rating[c[j].n].values.push([d,r]);
        }
    }
   }
   var vrc=[];
   var rrc=[];
   for( var m in volume){
     if ( volume.hasOwnProperty(m))
      vrc.push(volume[m]);
      rrc.push(rating[m]);
   }

  return [vrc,rrc];
}

