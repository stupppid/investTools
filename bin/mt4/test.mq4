//+------------------------------------------------------------------+
//|                                                         test.mq4 |
//|                        Copyright 2021, MetaQuotes Software Corp. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2021, MetaQuotes Software Corp."
#property link      "https://www.mql5.com"
#property version   "1.00"
#property strict
input float cw = 0;
input float margin = 0.0016;
input int coordinateValue = 0;
input float maxCoordinatedCw = 0.44;
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
float lastOrderAsk;
int closeIdx = 0;
int currentIdx = 0;
datetime last_time;
pick picks[28410];
float gap = 0.02;
double volume;
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
   int file = FileOpen("Datas" + StringSubstr(Symbol(),0,6) + Period() + ".csv",FILE_ANSI|FILE_READ|FILE_CSV);
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
            OrderClose(lastOrder,volume,lastOrderType ==OP_BUY ? Bid: Ask,10,clrRed);
            if(OrderSelect(lastOrder, SELECT_BY_POS)==true) 
               Print("Profit for the order " + lastOrder,OrderProfit()); 
            hasOpen = false;
            closeIdx = 0;
            currentIdx = 0;
         }
      }else {
         for(int i = 0; i < 24810; i++) {
            if(picks[i + 29].time == last_time) {
               // 开单
               if(picks[i].maxId == 0 && picks[i].min < 1 - margin) { 
                  if(cw == 0) {
                     volume = 0.05;
                  } else {
                     float ccw = cw + coordinateValue * ((1 - margin) - picks[i].min);
                     volume = (ccw > maxCoordinatedCw ? maxCoordinatedCw : ccw) * AccountInfoDouble(ACCOUNT_BALANCE) / (gap * 100000);
                     if(StringSubstr(Symbol(),2,3) == "USD") {
                        volume = MathRound(volume / Ask * 100) / 100;
                     }
                  }
                  closeIdx = picks[i].minId;
                  hasOpen = true;
                  lastOrder = OrderSend(Symbol(),OP_SELL,volume,Bid,20,Ask*(1 + gap),0,NULL,0,0,clrBlue);
                  lastOrderType = OP_SELL;
                  lastOrderAsk = Ask;
                
               }else if(picks[i].minId == 0 && picks[i].max > 1 + margin) { 
                  if(cw == 0) {
                     volume = 0.05;
                     } else {
                     float ccw = cw + coordinateValue * (picks[i].max - (1 + margin));
                     volume = (ccw > maxCoordinatedCw ? maxCoordinatedCw : ccw) * AccountInfoDouble(ACCOUNT_BALANCE) / (gap * 100000);
                     if(StringSubstr(Symbol(),2,3) == "USD") {
                        volume = MathRound(volume / Ask * 100) / 100;
                     }
                  }
                  closeIdx = picks[i].maxId;
                  hasOpen = true;
                  lastOrder = OrderSend(Symbol(),OP_BUY,volume,Ask,20,Bid*(1 - gap),0,NULL,0,0,clrBlue);
                  lastOrderType = OP_BUY;
                  lastOrderAsk = Ask;
               }
               
               break;
            }
         }
      }
   }
   last_time=iTime(NULL,0,0);
  }
//+------------------------------------------------------------------+
