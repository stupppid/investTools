//+------------------------------------------------------------------+
//|                                                    GetM1Data.mq5 |
//|                                          Copyright 2017,fxMeter. |
//|                                https://mql5.com/en/users/fxmeter |
//+------------------------------------------------------------------+
#property copyright "Copyright 2017,fxMeter."
#property link      "https://mql5.com/en/users/fxmeter"
#property version   "1.00"
#property strict
input int not_used;
//+-----------------------------------------------------------------------------+
//| Class    CMT4HstBar                                                         |
//| Purpose: Get M1 data in tester and write it into hst file.                  |
//|                                                                             |
//+-----------------------------------------------------------------------------+
class CMT4HstBar
  {
private:
   //--- hst file head data structure   
   int               m_digit;  //the digit of after point
   int               m_version;//the hst file version. it should be 401
   int               m_timeframe; //the time frame of hst chart
   int               m_unused[13];//unused space
   string            m_symbol;//the max length is 11 chars
   string            m_copyright;//copyright,the max length is 64 chars
   string            m_filename;//the hst file name

public:
                     CMT4HstBar();
                     CMT4HstBar(string sym,ENUM_TIMEFRAMES timeframe);
                    ~CMT4HstBar(){};

public:
   void              SaveData(int fileType=0);//write hst file after testing. the file is in the tester folder.  
  };
//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
CMT4HstBar::CMT4HstBar(void)
  {
   m_digit=_Digits;
   m_version=401;
   m_timeframe=_Period;
   ArrayInitialize(m_unused,0);
   m_symbol=StringSubstr(Symbol(),0,11);//max length 11.
   m_copyright= "Copyright 2017, MetaQuotes Software Corp.";
   m_filename = m_symbol+(string)m_timeframe+".csv";
  }
//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
CMT4HstBar::CMT4HstBar(string symbol,ENUM_TIMEFRAMES timeframe)
  {
   m_digit=_Digits;
   m_version=401;
   m_timeframe=(timeframe==0) ? Period():timeframe;
   ArrayInitialize(m_unused,0);
   m_symbol=StringSubstr(symbol,0,11);//max length 11.
   m_copyright= "Copyright 2017, MetaQuotes Software Corp.";
   m_filename = m_symbol+(string)m_timeframe+".csv";
  }
//+------------------------------------------------------------------+
//| SaveData()：write rates to hst file or txt file                  |
//| fileType=0 : hst file                                            |
//| fileType==1: txt file                                            |
//| fileType==2: hst and txt file                                    |
//+------------------------------------------------------------------+
void CMT4HstBar::SaveData(int fileType=0)
  {
   MqlRates rates[];
   int bars=Bars(m_symbol,(ENUM_TIMEFRAMES)m_timeframe);

   if(bars<=0)
     {
      printf("No data");
      return;
     }

   int cnt=CopyRates(m_symbol,(ENUM_TIMEFRAMES)m_timeframe,0,bars,rates);
   printf("bars = %d,copied number = %d",bars,cnt);
   if(cnt<=0)
     {
      Alert("copied data error#",GetLastError());
      return;
     }
   int handle=FileOpen(m_filename,FILE_TXT|FILE_WRITE|FILE_ANSI,',');
   if(handle==-1)
     {
      printf("Write TXT file %s  error# %d",m_filename,GetLastError());
      return;
     }
   //FileWrite(handle,"Time","Open","High","Low","Close","Vol");
   for(int i=0;i<cnt;i++)
     {
      string t=TimeToString(rates[i].time,TIME_DATE|TIME_MINUTES);
      string op=DoubleToString(rates[i].open);
      string hi=DoubleToString(rates[i].high);
      string lo=DoubleToString(rates[i].low);
      string cl=DoubleToString(rates[i].close);
      if(i > 0) {
      FileWrite(handle,t,op,hi,lo,cl,rates[i].tick_volume);
      }
     }
   FileFlush(handle);
   FileClose(handle);
     
  }

//+------------------------------------------------------------------+

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
//--- 

//---
   return(INIT_SUCCEEDED);
  }
//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
//--- 
/**
   string symbols[7] = {"EURUSD", "GBPUSD","NZDUSD","AUDUSD","USDCAD","USDJPY","USDCHF"};
   int periods[4] = {PERIOD_M15,PERIOD_H1,PERIOD_H4,PERIOD_D1}
   for(int i = 0; i < 7; i++) {
      for(int j = 0; j < 4;j++) {
         CMT4HstBar hstBar(symbols[i],periods[j]);
         hstBar.SaveData(1);
      }
   }
   */
         CMT4HstBar hstBar(Symbol(), Period());
         hstBar.SaveData();
  }
//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
  {
//---  
  }
//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
  {
//---

  }
//+------------------------------------------------------------------+
//| Trade function                                                   |
//+------------------------------------------------------------------+
void OnTrade()
  {
//---

  }
//+------------------------------------------------------------------+
