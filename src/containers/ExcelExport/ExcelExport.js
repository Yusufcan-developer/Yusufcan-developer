import React from "react";
import ReactDOM from "react-dom";
import "antd/dist/antd.css";
import { Table } from "antd";
import ExportJsonExcel from "js-export-excel";
import _ from 'underscore';
import moment from 'moment';

export default (columns, data,fileName) => {
  var option = {};
  let dataTable = [];
  let columnName = []
  let viewerColumns = []
  let dateTypeColumns = []

  //Column Name Array  
  _.each(columns, (columnItem) => {
    columnName.push(columnItem.title)
    viewerColumns.push(columnItem.dataIndex)
    if (columnItem.type === 'date') { dateTypeColumns.push(columnItem.dataIndex); }
  });


  if (data) {
    _.each(data, (item) => {

      //Preview column data 
      item = _.pick(item, viewerColumns);
      if (dateTypeColumns.length > 0) {
        _.each(dateTypeColumns, (itemDateColumn) => {
          item[itemDateColumn]=((moment(item[itemDateColumn]).toDate()))
        });
      }
      dataTable.push(item);
    })

  }
  option.fileName = fileName;
  option.datas = [
    {
      sheetData: dataTable,
      sheetName: "sheet",
      // sheetFilter: [
      //   "Organization ID",
      //   "Organization code",
      //   "Organization name"
      // ],

      sheetHeader: columnName
    }
  ];
  var toExcel = new ExportJsonExcel(option);
  toExcel.saveExcel();
}
