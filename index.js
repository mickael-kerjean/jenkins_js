
(function(){
    function updateTimers(){
        var $els = _getElements();
        $els.map(function(el){
            var timeDiff = Math.abs(Math.floor((new Date() - new Date(el.last_success.timestamp))/ 1000));
            el.last_success.$el.childNodes[0].textContent = _displayDate(timeDiff)
        });
    }
    function updateJobStatus(){
        var $els = _getElements();
        $els.map(function(el){
            console.log(el.last_success)
            //var timeDiff = Math.abs(Math.floor((new Date() - new Date(el.getAttribute('data')))/ 1000));
           // el.childNodes[0].nodeValue = displayDate(timeDiff)
        });
    }
    window.setInterval(updateTimers, 1000)
   // window.setInterval(updateJobStatus, 10000)

    function _getElements(){
        var dash = document.querySelector('#projectstatus'),
            jobs = [];
        if(dash){
            dash.querySelectorAll('tr[id]:not(.header)').forEach(function(job){
                $last_success = job.querySelectorAll('td')[6];
                jobs.push({
                    last_success:{
                        $el: $last_success,
                        timestamp: $last_success.getAttribute('data'),
                        link: $last_success.childNodes[1].getAttribute('href')
                    }
                })
            })
        }
        return jobs;
    }

    function _httpGet(url){
        var promise = new Promise(function(resolve, reject){
            var oReq = new XMLHttpRequest();
            oReq.onload = function (e) {
                resolve(e.target.response);
            };
            oReq.open('GET', url, true);
            oReq.responseType = 'json';
            oReq.send();
        });
        return promise;
    };
    function _getLastSuccess(job_name){
        var promise = new Promise(function(resolve, reject){
            var url = "https://jenkins-mikeulkeul.rhcloud.com/job/"+job_name+"/lastSuccessfulBuild/api/json?pretty=true"
            return _http.get(url)
                .then(function(e){
                    e && e.timestamp? resolve(e.timestamp) : reject('ERROR')
                });
        })
        return promise;
    }
    function _displayDate(timeDiff){
        function isGreaterThanZero(el){
            return el.time > 0? true :false;
        }
        function formatTimestamp(diff, acc){
            if(!acc){ acc = [] }
            if(acc.filter(isGreaterThanZero).length > 2){ return acc }

            var i = acc.length,
                base = [{time: 365*24*60*60,      label: 'year'},
                        {time: 60*60*24*(365/12), label:'month'},
                        {time: 60*60*24,          label: 'day'},
                        {time: 60*60,             label:'hr'},
                        {time: 60,                label:'min'},
                        {time:0,                  label:'sec'}],
                integer = base[i].time !== 0 ? Math.floor(diff / base[i].time) : diff,
                rest = diff % base[i].time;

            if(integer === 0){
                acc.push({time: 0, label:base[i].label});
                return formatTimestamp(diff, acc);
            }else{
                acc.push({time:integer, label:base[i].label});
                if( rest > 0){
                    return formatTimestamp(rest, acc)
                }else{
                    return acc;
                }
            }
        }
        return formatTimestamp(timeDiff)
            .filter(isGreaterThanZero)
            .slice(0, 2)
            .reduce(function(acc, el){
                acc += el.time+' '+el.label+' ';
                return acc;
            }, '')+' - ';
    }
})();
