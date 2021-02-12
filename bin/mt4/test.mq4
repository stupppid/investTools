//+------------------------------------------------------------------+
//|                                                         test.mq4 |
//|                        Copyright 2021, MetaQuotes Software Corp. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2021, MetaQuotes Software Corp."
#property link      "https://www.mql5.com"
#property version   "1.00"
#property strict
//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
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
pick picks[28410];
int OnInit()
  {
//---
   last_time=iTime(NULL,0,0);
   
//---
   return(INIT_SUCCEEDED);
  }
//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
//---
   
  }
//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
  {
//---
if(picks[0].max == 0){
   int file = FileOpen("Datas.csv",FILE_ANSI|FILE_READ|FILE_CSV);
   printf("file load..");
   int i = 0;
   if(file != INVALID_HANDLE)
   {
      printf("file load success");
      while(!FileIsEnding(file))
      {
         string t = FileReadString(file);
         string result[6];
         StringSplit(t, ' ',result);
         string t1 = result[0] + " " + result[1];
         string t2 = result[2];
         string t3 = result[3];
         string t4 = result[4];
         string t5 = result[5];
         //printf(t1);
         //printf(StringToTime(t1));
         picks[i].time = StringToTime(t1);
         picks[i].maxId = StringToInteger(t2);
         picks[i].max = StringToDouble(t3);
         picks[i].minId = StringToInteger(t4);
         picks[i].min = StringToDouble(t5);
         i++;
      }
   } else {
      printf(file);
   }
   printf(i);
   FileClose(file);

}
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
         for(int i = 0; i < 24810; i++) {
            if(picks[i + 29].time == last_time) {
               // 开单
               if(picks[i].maxId == 0) {
                  closeIdx = picks[i].minId;
                  hasOpen = true;
                  lastOrder = OrderSend(Symbol(),OP_SELL,0.1,Bid,10,0,0,NULL,0,0,clrBlue);
                  lastOrderType = OP_SELL;
               }else if(picks[i].minId == 0) {
                  closeIdx = picks[i].maxId;
                  hasOpen = true;
                  lastOrder = OrderSend(Symbol(),OP_BUY,0.1,Ask,10,0,0,NULL,0,0,clrBlue);
                  lastOrderType = OP_BUY;
               }
               
               break;
            }
         }
      }
   }
   last_time=iTime(NULL,0,0);
  }
//+------------------------------------------------------------------+
