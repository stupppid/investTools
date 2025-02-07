#property copyright "Copyright 2021, MetaQuotes Software Corp."
#property link      "https://www.mql5.com"
#property version   "1.00"
#property strict
input float cw = 0.38;
input float margin = 0.0016;

bool hasOpen = false;
int lastOrder;
int lastOrderType;
float lastOrderAsk;
int closeIdx = 0;
int currentIdx = 0;
datetime last_time;
float gap = 0.02;
double volume;
int inputLength = 30;

void knnFun() {
   MqlRates rates[];
   ArraySetAsSeries(rates,true); 
   int copied=CopyRates(Symbol(),0,1,inputLength + 1,rates);
   string out = "symbol="+ Symbol() +"&period=" + Period() + "&data="; 
   if(copied>0) 
     { 
      Print("Bars copied: "+copied); 
      string format="%G,%G,%G,%G,%d\r\n"; 
      for(int i=0;i<(inputLength + 1);i++) 
        { 
         out+=TimeToString(rates[i].time)+","+StringFormat(format, 
                                  rates[i].open, 
                                  rates[i].high, 
                                  rates[i].low, 
                                  rates[i].close, 
                                  rates[i].tick_volume); 
        } 
     } 
   else Print("Failed to get history data for the symbol ",Symbol());  
   char   data[]; 
   StringToCharArray(out,data);
   string str;
   int res = WebRequest("POST","http://localhost/invest/expert/knnCheck",NULL,59000,data,data,str);
   printf("res: " + res + "data: " + CharArrayToString(data));
   if(hasOpen) {
      currentIdx++;
      if(currentIdx >= closeIdx) {
         //if(Close[1] - Close[2] > 0 && lastOrderType)
         OrderClose(lastOrder,volume,lastOrderType ==OP_BUY ? Bid: Ask,10,clrRed);
         hasOpen = false;
         closeIdx = 0;
         currentIdx = 0;
      }
   }else {
      if(res == 200){
         string result[6];
         StringSplit(CharArrayToString(data), ' ',result);
         long maxId = StringToInteger(result[0]);
         float max = StringToDouble(result[1]);
         long minId = StringToInteger(result[2]);
         float min = StringToDouble(result[3]);
         volume = cw * AccountInfoDouble(ACCOUNT_BALANCE) / (gap * 100000);
         if(StringSubstr(Symbol(),2,3) == "USD") {
            volume = MathRound(volume / Ask * 100) / 100;
         }
         if(maxId == 0 && min < 1 - margin) {
            closeIdx = minId;
            hasOpen = true;
            lastOrder = OrderSend(Symbol(),OP_SELL,volume,Bid,20,Ask*(1 + gap),0,NULL,0,0,clrBlue);
            lastOrderType = OP_SELL;
            lastOrderAsk = Ask;
         }else if(minId == 0 && max > 1 + margin) {
            closeIdx = maxId;
            hasOpen = true;
            lastOrder = OrderSend(Symbol(),OP_BUY,volume,Ask,20,Bid*(1 - gap),0,NULL,0,0,clrBlue);
            lastOrderType = OP_BUY;
            lastOrderAsk = Ask;
         }
      }
   }
}

int OnInit()
  {
   hasOpen = false;
   last_time=iTime(NULL,0,0);
   knnFun();
   return(INIT_SUCCEEDED);
  }
  
void OnTick()
  {
   if(iTime(NULL,0,0)>last_time) {
      knnFun();
   }
   last_time=iTime(NULL,0,0);
  }