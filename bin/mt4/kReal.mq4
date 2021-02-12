//+------------------------------------------------------------------+
//|                                                        kReal.mq4 |
//|                        Copyright 2021, MetaQuotes Software Corp. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2021, MetaQuotes Software Corp."
#property link      "https://www.mql5.com"
#property version   "1.00"
#property strict
struct pick {
   datetime time;
   long maxId;
   double max;
   long minId;
   double min;
};
bool hasOpen = false;
int lastOrder;
int lastOrderType;
int closeIdx = 0;
int currentIdx = 0;
datetime last_time;
//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
//--- create timer
   hasOpen = false;
   MqlRates rates[]; 
   ArraySetAsSeries(rates,true); 
   int copied=CopyRates(Symbol(),0,1,1000,rates);
   string out = "symbol="+ Symbol() +"&period=" + Period() + "&data="; 
   if(copied>0) 
     { 
      Print("Bars copied: "+copied); 
      string format="%G,%G,%G,%G,%d\r\n"; 
      for(int i=0;i<1000;i++) 
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
   printf(last_time);
   char   data[]; 
   StringToCharArray(out,data); 
   int res;
   string str;
   res = WebRequest("POST","http://localhost/invest/expert/knnInit",NULL,59000,data,data,str);
   printf("res: " + res + "data: " + CharArrayToString(data));
   if(res == 200){
      string result[6];
      StringSplit(CharArrayToString(data), ' ',result);
      long maxId = StringToInteger(result[0]);
      float max = StringToDouble(result[1]);
      long minId = StringToInteger(result[2]);
      float min = StringToDouble(result[3]);
      printf("got info " + maxId);
      if(maxId == 0) {
         printf("sssss");
         closeIdx = minId;
         hasOpen = true;
         lastOrder = OrderSend(Symbol(),OP_SELL,0.1,Bid,10,0,0,NULL,0,0,clrBlue);
         lastOrderType = OP_SELL;
      }else if(minId == 0) {
         closeIdx = maxId;
         hasOpen = true;
         lastOrder = OrderSend(Symbol(),OP_BUY,0.1,Ask,10,0,0,NULL,0,0,clrBlue);
         lastOrderType = OP_BUY;
      }
   }
         
   last_time=iTime(NULL,0,0);
//---
   return(INIT_SUCCEEDED);
  }
//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   
  }
//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
  {
   if(iTime(NULL,0,0)>last_time) {
      if(hasOpen) {
         currentIdx++;
         if(currentIdx >= closeIdx) {
            //if(Close[1] - Close[2] > 0 && lastOrderType)
            OrderClose(lastOrder,0.1,lastOrderType ==OP_BUY ? Bid: Ask,10,clrRed);
            hasOpen = false;
            closeIdx = 0;
            currentIdx = 0;
         }
      }else {
         char data[];
         int res;
         string dataStr = "symbol=" + Symbol() + "&period=" + Period() + 
            "&lastData=" + Time[2] + "," + Open[2] + "," + High[2] + "," + Low[2] + "," + Close[2] + "," + Volume[2] +
            "&data=" +  Time[1] + "," + Open[1] + "," + High[1] + "," + Low[1] + "," + Close[1] + "," + Volume[1];
         StringToCharArray(dataStr,data); 
         string str;
         res = WebRequest("POST","http://localhost/invest/expert/knn",NULL,59000,data,data,str);
         printf("res: " + res + "data: " + CharArrayToString(data));
         if(res == 200){
            string result[6];
            StringSplit(CharArrayToString(data), ' ',result);
            long maxId = StringToInteger(result[0]);
            float max = StringToDouble(result[1]);
            long minId = StringToInteger(result[2]);
            float min = StringToDouble(result[3]);
            if(maxId == 0) {
               closeIdx = minId;
               hasOpen = true;
               lastOrder = OrderSend(Symbol(),OP_SELL,0.1,Bid,10,0,0,NULL,0,0,clrBlue);
               lastOrderType = OP_SELL;
            }else if(minId == 0) {
               closeIdx = maxId;
               hasOpen = true;
               lastOrder = OrderSend(Symbol(),OP_BUY,0.1,Ask,10,0,0,NULL,0,0,clrBlue);
               lastOrderType = OP_BUY;
            }
         }
      }
   }
   last_time=iTime(NULL,0,0);
  }