    //OPERAZIONI DI DEFAULT: Inizializzazione BOT
//Package per gestione bot
const telegramb=require("node-telegram-bot-api");
//Dichiarazione token ottenuta tramite registrazione su BotFather
const token="1015160955:AAFBV4HUbTBwOfU_xUr8F2JpBOpw0XWfvjk";
//Abilito il polling
const bot=new telegramb(token,{
    polling:true
});

//Pacchetto https per gestire le chiamate "GET" alle WebAPI di "AlphaVantage"
const https=require("https");
const fs=require("fs");

//var apidata="";
//var apimessage="";


//Comando START
bot.onText(/\/start/,(msg)=>
{
    bot.sendMessage(msg.chat.id, "FinanceBot: qui potete trovare le ultime quotazioni della borsa italiana, e sarà possibile effettuare ricerche di titoli sia su borsa italiana (FTSE MIB), sia sui mercati internazionali");
});

bot.onText(/\/help/,(msg)=>
{
    bot.sendDocument(msg.chat.id,'help.txt');
});


//Andamento Giornaliero -> Time Series Daily
bot.onText(/\/andamentogiornaliero/,(msg,message)=>
{
    var param=message.input.split(" ")[1];

    var apidata="";

    https.get("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+param.toUpperCase()+"&apikey=MR4FEOY80PHKFXOV", function(response,error){
        //console.log(response);
        response.on('data',function(chunk)
        {
            apidata+=chunk;
        });
        response.on('end',function()
        {
            let apimessage=JSON.parse(apidata);

            console.log(apimessage);

            let giorni=Object.keys(apimessage["Time Series (Daily)"]);

            console.log(giorni[0]);

            let messaggio="";

            for(let i=0;i<giorni.length;i++)
            {
                let format=apimessage["Time Series (Daily)"][giorni[i]];
                messaggio+="Data: "+giorni[i]+" "+"Open: "+format["1. open"]+" "+"Close: "+format["4. close"]+"\n";
            }

            let array=[];
            for(i=0;i<messaggio.length;i+=4000)
            {
                array.push(messaggio.slice(i,i+4000));
            }
            for(let mex of array)
            {
                bot.sendMessage(msg.chat.id,mex);
            }
        });
        if(error)
        {
            console.log(error);
        }
    });
});

//Andamento Settimanale -> Time Series Weekly
bot.onText(/\/andamentosettimanale/,(msg,message)=>
{
    var param=message.input.split(" ")[1];

    var apidata="";

    https.get("https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol="+param.toUpperCase()+"&apikey=MR4FEOY80PHKFXOV", function(response,error){
        //console.log(response);
        response.on('data',function(chunk)
        {
            apidata+=chunk;
        });
        response.on('end',function()
        {
            let apimessage=JSON.parse(apidata);

            console.log(apimessage);

            let giorni=Object.keys(apimessage["Weekly Time Series"]);

            console.log(giorni[0]);

            let messaggio="";

            for(let i=0;i<giorni.length;i++)
            {
                let format=apimessage["Weekly Time Series"][giorni[i]];
                messaggio+="Data: "+giorni[i]+" "+"Open: "+format["1. open"]+" "+"Close: "+format["4. close"]+"\n";
            }

            let array=[];
            for(i=0;i<messaggio.length;i+=4000)
            {
                array.push(messaggio.slice(i,i+4000));
            }
            for(let mex of array)
            {
                bot.sendMessage(msg.chat.id,mex);
            }
        });
        if(error)
        {
            console.log(error);
        }
    });
});

//Andamento Mensile -> Time Series Monthly
bot.onText(/\/andamentomensile/,(msg,message)=>
{
    var param=message.input.split(" ")[1];

    var apidata="";

    https.get("https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol="+param.toUpperCase()+"&apikey=MR4FEOY80PHKFXOV", function(response,error){
        //console.log(response);
        response.on('data',function(chunk)
        {
            apidata+=chunk;
        });
        response.on('end',function()
        {
            let apimessage=JSON.parse(apidata);

            console.log(apimessage);

            let giorni=Object.keys(apimessage["Monthly Time Series"]);

            console.log(giorni[0]);

            let messaggio="";

            for(let i=0;i<giorni.length;i++)
            {
                let format=apimessage["Monthly Time Series"][giorni[i]];
                messaggio+="Data: "+giorni[i]+" "+"Open: "+format["1. open"]+" "+"Close: "+format["4. close"]+"\n";
            }

            let array=[];
            for(i=0;i<messaggio.length;i+=4000)
            {
                array.push(messaggio.slice(i,i+4000));
            }
            for(let mex of array)
            {
                bot.sendMessage(msg.chat.id,mex);
            }
        });
        if(error)
        {
            console.log(error);
        }
    });
});

//
//SYMBOLSEARCH (/cercatiolo): All, filtro solo ITA, filtro solo EUR, filtro solo USD
                                //Con keyboard
var param="";
var mess="";

bot.onText(/\/symbolsearch/,(msg,message)=>
{
    param=message.input.split(" ")[1];
    mess=msg.chat.id;

    bot.sendMessage(msg.chat.id,"Scegliere che cosa visualizzare",
        {
            "reply_markup":
            {
                "keyboard":[["Mostra tutti i risultati"],["Mostra solo titoli FTSEMIB"],["Mostra solo titoli EUR"],["Mostra solo titoli USD"]]
            }
        });
});


bot.on("message", function(msg,callback)
{
    var all="Mostra tutti i risultati";
    var ftse="Mostra solo titoli FTSEMIB";
    var eur="Mostra solo titoli EUR";
    var usd="Mostra solo titoli USD";

    if(msg.text.toString()===all)
    {
        searchALL(param);
    }
    if(msg.text.toString()===ftse)
    {
        //Applico il filtro per visualizzare soltanto i dati con "region:MILAN"
        searchITA(param);
    }
    if(msg.text.toString()===eur)
    {
        searchEUR(param);
    }
    if(msg.text.toString()===usd)
    {
        searchUSD(param);
    }
});

function searchALL(param)
{
    var apidata="";
    
    https.get("https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords="+param.toUpperCase()+"&apikey=MR4FEOY80PHKFXOV", function(response,error){
        //console.log(response);
        response.on('data',function(chunk)
        {
            apidata+=chunk;
        });
        response.on('end',function()
        {
            let apimessage=JSON.parse(apidata);

            console.log(apimessage);

            let matches=Object.keys(apimessage["bestMatches"]);

            console.log(matches[0]);

            let messaggio="";

            for(let i=0;i<matches.length;i++)
            {
                let format=apimessage["bestMatches"][matches[i]];
                messaggio+="Symbol: "+format["1. symbol"]+"\n"+"Region: "+format["4. region"]+"\n"+"Currency: "+format["8. currency"]+"\n"+"MatchScore: "+format["9. matchScore"]+"\n"+"-----------"+"\n";
            }

            let array=[];
            for(i=0;i<messaggio.length;i+=4000)
            {
                array.push(messaggio.slice(i,i+4000));
            }
            for(let mex of array)
            {
                bot.sendMessage(mess,mex);
            }
        });
        if(error)
        {
            console.log(error);
        }
    });

}

function searchITA(param)
{
    var apidata="";
    
    https.get("https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords="+param.toUpperCase()+"&apikey=MR4FEOY80PHKFXOV", function(response,error){
        //console.log(response);
        response.on('data',function(chunk)
        {
            apidata+=chunk;
        });
        response.on('end',function()
        {
            const matches=JSON.parse(apidata).bestMatches;

            //Scandisco "apimessage" per effettuare il controllo sul campo "region"
            const controlarray=[];
            for(i=0;i<matches.length;i++)
            {
                if(matches[i]["4. region"]==="Milan")
                {
                    controlarray.push(matches[i]); 
                }
            }
            console.log(controlarray);
            //controlarray contiene già le info filtrate
            //Su quello ragiono sulla formattazione e stampa
            let messaggio="";
            for(let i=0; i<controlarray.length;i++)
            {
                messaggio+="Symbol: "+controlarray[i]["1. symbol"]+"\n"+"Region: "+controlarray[i]["4. region"]+"\n"+"Currency: "+controlarray[i]["8. currency"]+"\n"+"MatchScore: "+controlarray[i]["9. matchScore"]+"\n"+"-----------"+"\n";
            }

            let array=[];
            for(i=0;i<messaggio.length;i+=4000)
            {
                array.push(messaggio.slice(i,i+4000));
            }
            for(let mex of array)
            {
                bot.sendMessage(mess,mex);
            }
           
        });
        if(error)
        {
            console.log(error);
        }
    });
}

function searchEUR(param)
{
    var apidata="";
    
    https.get("https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords="+param.toUpperCase()+"&apikey=MR4FEOY80PHKFXOV", function(response,error){
        //console.log(response);
        response.on('data',function(chunk)
        {
            apidata+=chunk;
        });
        response.on('end',function()
        {
            const matches=JSON.parse(apidata).bestMatches;

            //Scandisco "apimessage" per effettuare il controllo sul campo "currency"
            const controlarray=[];
            for(i=0;i<matches.length;i++)
            {
                if(matches[i]["8. currency"]==="EUR")
                {
                    controlarray.push(matches[i]); 
                }
            }
            console.log(controlarray);
            //controlarray contiene già le info filtrate
            //Su quello ragiono sulla formattazione e stampa
            let messaggio="";
            for(let i=0; i<controlarray.length;i++)
            {
                messaggio+="Symbol: "+controlarray[i]["1. symbol"]+"\n"+"Region: "+controlarray[i]["4. region"]+"\n"+"Currency: "+controlarray[i]["8. currency"]+"\n"+"MatchScore: "+controlarray[i]["9. matchScore"]+"\n"+"-----------"+"\n";
            }

            let array=[];
            for(i=0;i<messaggio.length;i+=4000)
            {
                array.push(messaggio.slice(i,i+4000));
            }
            for(let mex of array)
            {
                bot.sendMessage(mess,mex);
            }
           
        });
        if(error)
        {
            console.log(error);
        }
    });
}

function searchUSD(param)
{
    var apidata="";
    
    https.get("https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords="+param.toUpperCase()+"&apikey=MR4FEOY80PHKFXOV", function(response,error){
        //console.log(response);
        response.on('data',function(chunk)
        {
            apidata+=chunk;
        });
        response.on('end',function()
        {
            const matches=JSON.parse(apidata).bestMatches;

            //Scandisco "apimessage" per effettuare il controllo sul campo "region"
            const controlarray=[];
            for(i=0;i<matches.length;i++)
            {
                if(matches[i]["8. currency"]==="USD")
                {
                    controlarray.push(matches[i]); 
                }
            }
            console.log(controlarray);
            //controlarray contiene già le info filtrate
            //Su quello ragiono sulla formattazione e stampa
            let messaggio="";
            for(let i=0; i<controlarray.length;i++)
            {
                messaggio+="Symbol: "+controlarray[i]["1. symbol"]+"\n"+"Region: "+controlarray[i]["4. region"]+"\n"+"Currency: "+controlarray[i]["8. currency"]+"\n"+"MatchScore: "+controlarray[i]["9. matchScore"]+"\n"+"-----------"+"\n";
            }

            let array=[];
            for(i=0;i<messaggio.length;i+=4000)
            {
                array.push(messaggio.slice(i,i+4000));
            }
            for(let mex of array)
            {
                bot.sendMessage(mess,mex);
            }
           
        });
        if(error)
        {
            console.log(error);
        }
    });
}


bot.on("polling_error",function(err)
{
    console.log(err);
});