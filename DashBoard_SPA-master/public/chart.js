

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
        setM:''
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
                                labels: alllabel,
                                datasets:allt
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
        
        },
        getWeeksValue: function () {
            const realtime =new Date();
            realtime.setHours(realtime.getHours() + 33);
            let theDate = new Date(this.setM + 'T00:00:00');
            theDate.setHours(theDate.getHours() + 9);   
            console.log(theDate);
            
            
            let theDateLimit = new Date(this.setM + 'T00:00:00');
            theDateLimit.setHours(theDateLimit.getHours() +705);
            console.log(theDateLimit);

            if (theDate.getTime() > realtime.getTime()) {
                console.log(theDate.getTime() );
                console.log( realtime.getTime() );

                return this.error = '입력한 날짜가 올바르지 않습니다.'
            }
            // } else if(theDate.getDay() != 1){
            //     return this.error = '월요일만 입력할 수 있습니다.'
            // }
    
            
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
                            labels: ['Mon','Tus','Wed','Thr','Fri','Sat','Sun'],
                            datasets: [{
                                label: '1 week',
                                backgroundColor: window.chartColors.red,
                                borderColor: window.chartColors.red,
                                data: [

                                ],
                                fill: false,
                            },
                            {
                                label: '2 week',
                                backgroundColor: window.chartColors.orange,
                                borderColor: window.chartColors.orange,
                                data: [

                                ],
                                fill: false,
                            },
                            {
                                label: '3 week',
                                backgroundColor: window.chartColors.yellow,
                                borderColor: window.chartColors.yellow,
                                data: [

                                ],
                                fill: false,
                            },
                            {
                                label: '4 week',
                                backgroundColor: window.chartColors.green,
                                borderColor: window.chartColors.green,
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
                 

                    

                    var count = 1;
                    var daynum =1;
                    var weeknum =0;
                    var Break = new Error('Break');
                    
                    try{
                    querySnapshot.forEach(function (doc) {
                        console.log(doc.data());
                        console.log(convertDate(doc.data().time).getDay());
                        if (convertDate(doc.data().time).getDay() === daynum) {
                            if(config.data.datasets[weeknum].data.length == 0){
                                config.data.datasets[weeknum].data.push(doc.data().inside_temp);

                            }
                            else{
                            config.data.datasets[weeknum].data[config.data.datasets[weeknum].data.length - 1] += doc.data().inside_temp;
                          
                            }   
                            count++;
                        }

                        else {
                            if (count > 1) { 
                                config.data.datasets[weeknum].data[config.data.datasets[weeknum].data.length - 1] /= count; 
                            }
                           
                            config.data.datasets[weeknum].data.push(doc.data().inside_temp);
                            count = 1;
                            daynum++;
                            if(daynum == 7){
                                weeknum += 1;
                                if(weeknum >= 4){
                                    console.log('Breaked')
                                    throw Break;
                                }
                                daynum =0;
                            }
               
                        }
                        
            
                      
                     
                        
                    });
                    }catch(e)
                    {
                        if (e!= Break) throw Break; 
                    }
                    console.log(JSON.stringify(config.data.datasets));

                    var ctx = document.getElementById('canvas3').getContext('2d');
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





