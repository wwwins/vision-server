#!/usr/bin/env python2
#
# Copyright 2019 isobar. All Rights Reserved.
#
# Count files in folder
#
# Usage:
#       image-cnt.py public/upload
#
import os
import sys
import time
import glob

def main(folder):
    file_cnt_by_date = {}
    files = glob.glob(folder+'*')
    for f in files:
        ftime = time.gmtime(os.path.getmtime(f))
        mon = '0'+str(ftime.tm_mon)
        day = '0'+str(ftime.tm_mday)
        hour = str(ftime.tm_hour)
        minutes = str(ftime.tm_min)
        #print(mon+day+' '+hour+':'+minutes+'\t'+f)
        key=mon[-2:]+day[-2:]
        if key in file_cnt_by_date:
            file_cnt_by_date[key] = file_cnt_by_date[key]+1
        else:
            file_cnt_by_date[key] = 1
    print('Date:\tCount')
    for i in sorted(file_cnt_by_date):
        print(i+':\t'+str(file_cnt_by_date[i]))

folder = sys.argv[1]
main(folder)
