# DASHBOARD_MC 온습도 현황판

### Node.js Server, Firebase DB, MicroDevice, 기상청API 를 활용한,Vue.js

### 목차

1. 프로젝트 개괄
2. 사용기술 및 시스템구성
3. DBMS (NoSQL)
4. 주요 소스코드
5. 결과 화면 및 증빙 사진

---

# 1. 프로젝트 개괄

### 1.1 기획의도

: 건물 내 · 외부 기온 및 습도 현황 및 과거 추세 확인

 → 향후 가습기, 냉난방 조절 등 스마트 홈/오피스 확장 가능

### 1.2 데이터 수집

- 내부 데이터 → `MicroDevice` 사용 직접 수집
- 외부 데이터 → `기상청 API` 동네예보조회 활용
*기상청 API의 경우 최근 24시간 이내 데이터만 제공,
 주기적으로 자체 DB에 기록하여 과거 데이터 축적

---

# 2. 사용기술 및 시스템 구성

전체 구성

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/11059282-46cc-45dd-b51f-cb53a577082d/dashboard_system2.png](https://user-images.githubusercontent.com/23710051/73605892-863b0c00-45e7-11ea-96ac-87c06c2d1a37.png)

Server 구성

![Server](https://user-images.githubusercontent.com/23710051/73605893-863b0c00-45e7-11ea-9375-80cb1449950b.png)

1. Web Front
: `HTML5` , `CSS3.0`, `JavaScript(ESMA6)`, `Bootstrap`, `jQuery(3.4.1)` `Vue.js ` ,` Webpack`
2. ,Server ( DB / Hosting )
: `Node.js(12.14.1)`, `Firebase Hosting`
3. DBMS (NoSQL)
: `Google Firebase Cloud Firestore`
4. MicroDevice
: `ARM® 32-bit Cortex®-M0 CPU (stm32f0518t6)` , `AM2320` (온습도센서)

---

# 3. 데이터베이스

### 3.1 DBMS (NoSQL)

 : Google Firebase Cloud Firestore

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/b1ddaa57-5cec-429d-8e1c-fc1c92297b3b/db.png](https://user-images.githubusercontent.com/23710051/73605894-863b0c00-45e7-11ea-976d-48b3a2d99b03.png)

- 컬렉션(collection) : "mc"
    - 문서(doc) : "YYYYMMDDhhmm" (time필드를 포맷 변환한 String)
        - 필드 **5개*
            1. inside_hum
            2. inside_temp
            3. outside_hum
            4. outside_temp
            5. time
            *데이터타입 → "Firebase Timestamp"
            ( JS  ↔ Firebase 데이터 교환시, `Date객체` ↔ `Timestamp`객체 자동 변환)

### 3.2 데이터 구조 특징

- **기상청 API** 외부 데이터 → `3시간 간격`으로 제공

    02시부터 3시간 간격으로, (02, 05, 08, 11, 14, 17, 20, 23시)

    `03, 06, 09, 12, 15, 18, 21, 24시` 기준의 실측 및 예측 데이터 제공

    **과거(실측) 데이터의 경우 최근 24시간 데이터만 제공*

- **IoT장비** 사용 실내 데이터 → `1시간 간격`으로 측정

▶ **외/내부 데이터 빈도 차이 발생** *(시간대별로 레코드 필드 수 차이)*

- 매 00, 03, 06, 09, 12... 시 : `5개 필드`

    Collection.doc("03시") = {
    													inside_tmep : 
    													inside_hum : 
    													outside_temp : 
    													outside_hum : 
    													time : 																								
    												}

- 매 01, 02, 04, 05, 07, 08... 시 : `3개 필드`

    Collection.doc("01시") = {
    													outside_temp : 
    													outside_hum : 
    													time : 																								
    												}

---

# 4. 주요 소스코드

소목차

### 1. 서버 사이드

1. 외부(API) 데이터 Input 코드
2. 실내(Log) 데이터 Input 코드
3. Node.js Server Configuration서버 환경설정

### 2. 클라이언트 사이드

1. 현재(가장 최근) 현황 출력
  : `getLatestData()`
  → Select from Firebase DB (가장 최근 레코드 1개)
  → 출력

2. 수집한 데이터를 차트로 출력

   : vue.js를 이용하여 비동기 화면 구축, vue 객체를 선언하고 그안에 컴포넌트를 추가해서 슬라이드 효과를 넣을 수 있는 Hooper.js 라이브러리 사용

### 3. Time Format 관련

### 1. 서버 사이드 주요 소스 코드

1. 외부(API) 데이터 Input 코드

    ```javascript
    // 기상청 API 정보 가져오는 로직
    var getWeatherAPI = function(basetime){
        var base_date = dateObjToString_Base_Date(basetime);
        var base_time = dateObjToString_Base_Time(basetime);
        
        // 서울시 강남구 역삼동 좌표
        var nx = '61';
        var ny = '125';
    
        var xhr = new XMLHttpRequest();
        var url = 'http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastSpaceData'; /*URL*/
        var queryParams = '?' + encodeURIComponent('ServiceKey') + '='+'ServiceKey'; /*Service Key*/
        queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent( base_date ); /*‘15년 12월 1일발표*/
        queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent( base_time ); /*05시 발표 * 기술문서 참조*/
        queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(nx); /*예보지점의 X 좌표값*/
        queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(ny); /*예보지점의 Y 좌표값*/ //역삼동
        queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('300'); /*한 페이지 결과 수*/
        queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /*페이지 번호*/
        queryParams += '&' + encodeURIComponent('_type') + '=' + encodeURIComponent('json'); /*xml(기본값), json*/
        
        xhr.open('GET', url + queryParams);
        xhr.onreadystatechange = function () {
          if (this.readyState == 4) {
              result = eval('('+this.responseText+')');
              array = result.response.body.items.item
              var obj = new Object();
              
              for(i of array){
                var key = ''+i.fcstDate+i.fcstTime;
                if(i.category === 'REH') { var hum = i.fcstValue; };
                if(i.category === 'T3H') { var temp = i.fcstValue; };
                obj[key] = {'hum':hum, 'temp':temp}            
              };
    
              for(var key in obj) {
    						// Firebase DB에 데이터 Insert
                addOutsideData(key, obj[key].hum, obj[key].temp);
              };
          }
        };
        xhr.send('');
    }
    ```

2. 실내(Log) 데이터 Input 코드

    ```javascript
    //MUC -> NodeJS : Data 받는 로직 안에 실행 // MCU에서 10분마다 정보 전송
    serialPort.open(function() {
      console.log("Device connected...");
      var buff = "";
      serialPort.on("data", function(data) {
        console.log("Data : " + data);
        
        buff += data;
        if (buff.indexOf("\n") !== -1) {
              //data를 buff에 담아서 처리, hum, temp 변수에 값 삽입
              if(buff.charAt(2)=== 't') {
                console.log("buff temp")
                temp = buff.substring(0,2);
              } else if (buff.charAt(2)=== 'h') {
                console.log("buff hum")
                hum = buff.substring(0,2);
              } else {
                console.log("error : buff empty")
              }
    
          console.log("buff : " + buff);
          buff = ""; //clear the Buffer
        }
        
        // MCU -> Server 전송 주기가 10min이므로 매 시간당 2번씩 실행됨
        if( new Date().getMinutes() < 20 ) { 
          if(hum != undefined && temp != undefined) {
            console.log("inside add")
            var LOGBasetime = getLatestLOGBasetime();
            var key = dateObjToString(LOGBasetime);
            addInsideData(key, parseInt(hum), parseInt(temp));
            addInsideData2(key, parseInt(hum), parseInt(temp));
            temp = undefined;
            hum = undefined;
          }
        }
      });
    });
    ```
    
3. Node.js 서버 환경설정

    ```javascript
    // NodeJS Server Configuration
    var app = http.createServer(function(request,response){
      var url = request.url;
      if(request.url == '/favicon.ico'){
          response.writeHead(404);
          response.end();
          return;
      }
      response.writeHead(200);
      response.end(fs.readFileSync(__dirname + url));
    });
    app.listen(3000); // 3000번 포트 사용4 
    ```

### 2. 클라이언트 사이드 주요 소스 코드

1. 현재(가장 최근) 현황 출력
: `getLatestData()`
→ Select from Firebase DB (가장 최근 레코드 1개)
→ 출력

   ```javascript
    var getLatestData = function() {
        var latestLOGBasetime = dateObjToString( getLatestLOGBasetime() );
        var latestAPIBasetime = dateObjToString( getLatestAPIBasetime() );
    
        var docRefIn = db.collection("mc").doc(latestLOGBasetime);
        var docRefOut = db.collection("mc").doc(latestAPIBasetime);
    
        docRefIn.get().then(function(doc) {
            if (doc.exists) {
              document.getElementById('insideTemp').innerHTML = doc.data().inside_temp
              document.getElementById('insideHum').innerHTML = doc.data().inside_hum
              humDraw("inside", doc.data().inside_hum)
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
    
        docRefOut.get().then(function(doc) {
            if (doc.exists) {
              document.getElementById('outsideTemp').innerHTML = doc.data().outside_temp
              document.getElementById('outsideHum').innerHTML = doc.data().outside_hum
              humDraw("outside", doc.data().outside_hum)
    
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
      }
   ```

2. Chart 표시

   2.1 index.html의 섹션 부분

   ```html
   <section class="page-section text-white mb-0" id="about" style="background-color:mediumaquamarine;">
       <div id=hooper>
         <hooper style="height: 70%;">
           <slide>
             <div style="margin : 0 auto; padding: 10px; width:75%; background-color: lightcyan;">
               <h1 style="color: black;">기간 설정</h1>
   
               <input v-model="setSD" type="date">
   
               <h1 style="display: inline; color: black;"> ~ </h1>
               <input v-model="setED" type="date">
               <input type ='button' v-on:click="callFirebase" value="Submit">
               <p style="color: red;">{{ error }}</p>
               <canvas id="canvas"></canvas>
   
               <!-- <button class="btn btn-primary btn-xl" id="addStatus">Add Status</button> -->
             </div>
           </slide>
   
           <slide>
             <div style="margin : 0 auto; padding: 10px; width:75%; background-color: lightcyan;">
               <h1 style="color: black;">날짜 설정</h1>
       
               <input v-model="setD"  type="date">
               <input type="button"  value = "불러오기" v-on:click="getOneDayValue()">
               
               <canvas id="canvas2"></canvas>
   
               <button class="btn btn-primary btn-xl" id="addStatus1">Add Status</button>
             </div>
           </slide>
           <hooper-navigation slot="hooper-addons"></hooper-navigation>
           <hooper-pagination slot="hooper-addons" ></hooper-pagination>
         </hooper>
       </div>
   
     </section>
   ```

   2.2 chart.js

   ```javascript
   var db = firebase.firestore();
   var psdataset={label:'',backgroundColor:'',data:[],borderColor:'',fill:true};
   var alldata=[];
   var alllabel=[];
   function convertDate(timestamp) {
   
       return new firebase.firestore.Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate()
   }
   
   
   new Vue({
       el: '#hooper',
       components: {
           Hooper: window.Hooper.Hooper,
           Slide: window.Hooper.Slide,
           HooperNavigation: window.Hooper.Navigation,
           HooperPagination: window.Hooper.Pagination
       },
       data: {
           setSD: '',
           setED: '',
           setD:'',
           error: '',
       },
   
       methods: {
           callFirebase: function () {
               
               const realtime =new Date();
               realtime.setHours(realtime.getHours() + 33);
               let startdate = new Date(this.setSD + 'T00:00:00');
               startdate.setHours(startdate.getHours() + 9);
               let enddate = new Date(this.setED + 'T00:00:00');
               enddate.setHours(enddate.getHours() + 33);
   
               if (enddate.getTime() > realtime.getTime()) {
                   console.log(enddate.getTime() );
                   console.log( realtime.getTime() );
   
                   return this.error = '입력한 날짜가 올바르지 않습니다.'
               }
   
               else {
                  
                   db.collection("mc").
                       where("time", ">=", new Date(startdate.toISOString().split('.', 1)[0])).
                       where("time", "<", new Date(enddate.toISOString().split('.', 1)[0])).
                       get().then(function (querySnapshot) {
   
   
                           window.chartColors = [
                               red= 'rgb(255, 99, 132)',
                               orange= 'rgb(255, 159, 64)',
                               yellow= 'rgb(255, 205, 86)',
                               green= 'rgb(75, 192, 192)',
                               blue= 'rgb(54, 162, 235)',
                               purple= 'rgb(153, 102, 255)',
                               grey= 'rgb(201, 203, 207)'
                           ];
   
                           var config = {
                               type: 'line',
                               data: {
                                   labels: [],
                                   datasets:[]
                               },
                               options: {
                                   responsive: true,
                                   title: {
                                       display: true,
                                       text: 'Chart.js Line Chart'
                                   },
                                   tooltips: {
                                       mode: 'index',
                                       intersect: false,
                                   },
                                   hover: {
                                       mode: 'nearest',
                                       intersect: true
                                   },
                                   scales: {
                                       xAxes: [{
                                           display: true,
                                           scaleLabel: {
                                               display: true,
                                               labelString: 'Date'
                                           }
                                       }],
                                       yAxes: [{
                                           display: true,
                                           scaleLabel: {
                                               display: true,
                                               labelString: 'Value'
                                           }
                                       }]
                                   }
                               }
                           };
   
                           var crancolor=Math.floor(Math.random()*6);
                          
   
                           var count = 0;
                          
                           querySnapshot.forEach(function (doc) {
   
                               if (convertDate(doc.data().time).getDate() + '일' === config.data.labels[config.data.labels.length - 1]) {
                                   psdataset.data[ psdataset.data.length - 1] += doc.data().inside_temp;
                                   count++;
   
                                   if (convertDate(doc.data().time).getDate() === enddate.getDate() - 1) {
   
                                       psdataset.data[ psdataset.data.length - 1] =psdataset.data[ psdataset.data.length - 1] / count;
                                   }
                               }
   
   
                               else {
                                   if (count > 1) {
                                       psdataset.data[ psdataset.data.length - 1] = psdataset.data[ psdataset.data.length - 1] / count
                                   }
                                  
                                   alllabel.push((convertDate(doc.data().time).getDate()) + '일');
                                   psdataset.data.push(doc.data().inside_temp);
                               }
   
   
                           });
                           psdataset.label=startdate.toDateString()+'~'+enddate.toDateString();
                           psdataset.backgroundColor=window.chartColors[crancolor];
                           psdataset.borderColor=window.chartColors[crancolor];
                           console.log(JSON.stringify(psdataset));
                           alldata.push(psdataset);
                           psdataset={label:'',backgroundColor:'',data:[],borderColor:'',fill:true};
   
                           
                          
   
   
   
                           var ctx = document.getElementById('canvas').getContext('2d');
                           if (window.myLine == null) {
                               console.log("create chart")
                               window.myLine = new Chart(ctx, config);
                           }
   
                           else {
                               console.log("update chart")
                               window.myLine.update();
                           }
   
   
   
                       })
                       .catch(function (error) {
                           console.log("Error getting documents: ", error);
                       });
                       return this.error='';
               }
           },
           getOneDayValue: function () {
   
               let theDate = new Date(this.setD + 'T00:00:00');
               theDate.setHours(theDate.getHours() + 9);   
               console.log(theDate);
               
               
               let theDateLimit = new Date(this.setD + 'T00:00:00');
               theDateLimit.setHours(theDateLimit.getHours() + 33);
               console.log(theDateLimit);
       
               
               db.collection("mc").
                   where("time", ">=", new Date(theDate.toISOString().split('.', 1)[0])).
                   where("time", "<", new Date(theDateLimit.toISOString().split('.', 1)[0])).
                   get().then(function (querySnapshot) {
   
                       window.chartColors = {
                           red: 'rgb(255, 99, 132)',
                           orange: 'rgb(255, 159, 64)',
                           yellow: 'rgb(255, 205, 86)',
                           green: 'rgb(75, 192, 192)',
                           blue: 'rgb(54, 162, 235)',
                           purple: 'rgb(153, 102, 255)',
                           grey: 'rgb(201, 203, 207)'
                       };
   
                       var config = {
                           type: 'line',
                           data: {
                               labels: [],
                               datasets: [{
                                   label: '온도',
                                   backgroundColor: window.chartColors.red,
                                   borderColor: window.chartColors.red,
                                   data: [
   
                                   ],
                                   fill: false,
                               }]
                           },
                           options: {
                               responsive: true,
                               title: {
                                   display: true,
                                   text: 'Day Chart'
                               },
                               tooltips: {
                                   mode: 'index',
                                   intersect: false,
                               },
                               hover: {
                                   mode: 'nearest',
                                   intersect: true
                               },
                               scales: {
                                   xAxes: [{
                                       display: true,
                                       scaleLabel: {
                                           display: true,
                                           labelString: 'Date Time'
                                       }
                                   }],
                                   yAxes: [{
                                       display: true,
                                       scaleLabel: {
                                           display: true,
                                           labelString: 'Value'
                                       }
                                   }]
                               }
                           }
                       };
                    
                   
                       document.getElementById('addStatus1').addEventListener('click', function () {
                           var realtime = new Date();
                           console.log("data input");
                           db.collection("study").doc(realtime.toString()).set({
   
                               temp: Math.floor(Math.random() * 10) + 1,
                               hum: Math.floor(Math.random() * 10) + 1,
                               time: realtime
   
                           })
                               .then(function () {
   
                                   console.log("Document successfully written!");
                               })
                               .catch(function (error) {
                                   console.error("Error writing document: ", error);
                               });
   
   
                       });
                       
   
                       var count = 1;
   
                       if( config.data.labels != null){
                           config.data.labels = [];
                           config.data.datasets[0].data = [];
                           count = 1;
                       }
                       
                       
                       querySnapshot.forEach(function (doc) {
                           console.log(doc.data());
                           if (convertDate(doc.data().time).getHours() + '시' === config.data.labels[config.data.labels.length - 1]) {
                               config.data.datasets[0].data[config.data.datasets[0].data.length - 1] += doc.data().inside_temp;
                               count++;
                           }
   
                           else {
                               if (count > 1) { 
                                   console.log(count);
                                   config.data.datasets[0].data[config.data.datasets[0].data.length - 1] /= count; 
                               }
                               config.data.labels.push(convertDate(doc.data().time).getHours() + '시');
                               config.data.datasets[0].data.push(doc.data().inside_temp);
                               count = 1;
                           }
                           
                           console.log(JSON.stringify(config.data.labels));
                           console.log(JSON.stringify(config.data.datasets));
                         
                       });
                     
   
                       var ctx = document.getElementById('canvas2').getContext('2d');
                       if( window.myLine == null){
                           window.myLine = new Chart(ctx, config);
                       }
                      
                       else{
                           window.myLine.destroy();
                           window.myLine = new Chart(ctx, config);
                       }
   
   
                   })
                   .catch(function (error) {
                       console.log("Error getting documents: ", error);
                   });
           
           }
       }
   })
   ```

   

### 3. Time Format 관련 주요 소스 코드

- `API` ↔ `웹브라우저` ↔ `DB` 간 데이터 입출력시 key의 일관성 필요.
- 아래와 같이 Time Format 설정 함수들을 정의하여 사용.

    ```javascript
    var getLatestAPIBasetime = function() {
      var a = new Date();
      var b = a.getTime();
      b -= b%(1000*60*60); // 분단위 이하 내림
      var c = a.getHours();
      if (c%3 == 0) {
        b-=(1000*60*60*1)
      } else if (c%3 == 1) {
        b-=(1000*60*60*2)
      } //else if (c%3 == 2) {
        //b-=(1000*60*60*0);
      //};
      return new Date(b);
    };
    
    var getLatestLOGBasetime = function() {
      var a = new Date();
      var b = a.getTime();
      b -= b%(1000*60*60); // 분단위 이하 내림
      return new Date(b);
    };
    
    //'201007031500' (YYYYMMDDHHMM) -> JavaScript Date Object 
    var stringToDateObj = function(string) {
      return new Date(string.substr(0,4), string.substr(4,2)-1, string.substr(6,2), string.substr(8,2), string.substr(10,2));
    };
    
    //JavaScript Date Object -> '201007031500' (YYYYMMDDHHMM)
    var dateObjToString = function(date) {
      return dateObjToString_Base_Date(date)+dateObjToString_Base_Time(date)
    }
    
    //JavaScript Date Object -> '20100703' (YYYYMMDD)
    var dateObjToString_Base_Date = function(date) {
      var base_date = (date.getYear()+1900)+'';
      if (date.getMonth() < 10 ) { base_date += '0'; }
      base_date += (date.getMonth()+1);
      if ( date.getDate() < 10 ) { base_date += '0'; }
      base_date += date.getDate();
      
      return base_date
    }
    
    //JavaScript Date Object -> '1500' (HHMM)
    var dateObjToString_Base_Time = function(date) {  
      var base_time = '';
      if (date.getHours() < 10) { base_time += '0'; }
      base_time += ( date.getHours()*100 );
    
      return base_time
    }
    ```

# 5.출력 화면 및 증빙 사진

현황 원형 차트 구현

![현황 차트](https://user-images.githubusercontent.com/23710051/73591170-b672a400-452e-11ea-9cea-f5efaf1b97e7.png)

정해진 기간의 데이터를 일별로 나타내는 차트 구현

![기간 차트](https://user-images.githubusercontent.com/23710051/73605895-86d3a280-45e7-11ea-9f5b-4418f25bbf5d.png)

한달치 데이터를 요알마다마다 나타낸 차트 구현

![한달 데이터 차트](https://user-images.githubusercontent.com/23710051/73605891-863b0c00-45e7-11ea-8d34-5ed51e50ddb1.png)

일별 차트  구현

![시간대별 차트](https://user-images.githubusercontent.com/23710051/73591172-b70b3a80-452e-11ea-8aec-47664ebb6c1b.png)



슬라이드 구현

![슬라이드 구현](https://user-images.githubusercontent.com/23710051/73591171-b672a400-452e-11ea-8c2d-906facf0a74a.png)

