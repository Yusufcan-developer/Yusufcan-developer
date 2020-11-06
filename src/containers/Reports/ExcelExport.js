
import "antd/dist/antd.css";
import ExportJsonExcel from "js-export-excel";
import _ from 'underscore';
import moment from 'moment';

export default (columns, data, fileName, dataDetail, detailColumns) => {
  var option = {};
  let dataTable = [];
  let columnName = [];
  let detailColumnsName = [];
  let viewerColumns = [];
  let viewerDetailColumns = [];
  let dateTypeColumns = [];

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
      const itemDetail = _.findWhere(dataDetail, {
        Key: item.orderNo
      })
      if (dateTypeColumns.length > 0) {
        _.each(dateTypeColumns, (itemDateColumn) => {
          item[itemDateColumn] = ((moment(item[itemDateColumn]).toDate()))
        });
      }
      dataTable.push(item);

      if (dataDetail.length > 0) {
        //Detail Column Name Array  
        _.each(detailColumns, (columnItem) => {
          detailColumnsName.push(columnItem.title);
          viewerDetailColumns.push(columnItem.dataIndex);
          if (columnItem.type === 'date') { dateTypeColumns.push(columnItem.dataIndex); }
        });
        dataTable.push(detailColumnsName);
        //Detail Data
        _.each(itemDetail.Value, (detail) => {
          detail = _.pick(detail, viewerDetailColumns);
          dataTable.push(detail);
        })
        dataTable.push([])
      }
    })
  }
  option.fileName = fileName;
  option.datas = [
    {
      sheetData: dataTable,
      sheetName: "sheet",
      sheetHeader: columnName,
    }
  ];
  var toExcel = new ExportJsonExcel(option);
  toExcel.saveExcel();
}
