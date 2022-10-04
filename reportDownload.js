define(["qlik", "text!./template.html"],
  function (qlik, template) {

    return {
      template: template,
      support: {
        snapshot: true,
        export: true,
        exportData: false
      },
      paint: function () {
        return qlik.Promise.resolve();
      },
      controller: ['$scope', function ($scope) {
        //add your rendering code here
        var app = qlik.currApp(this);       //defines app to workon
        var currentSheet = qlik.navigation.getCurrentSheetId();
        var currentSheetId = currentSheet.sheetId;
        var tableIds = getTables(currentSheetId);

        //initializing function to get table data
        function getTables(currentSheetId) {
          let tableIDs = [];
          app.getAppObjectList('sheet', function (reply) {
            for (sheet of reply.qAppObjectList.qItems) {
              if (sheet.qInfo.qId == currentSheetId) {
                for (object of sheet.qData.cells) {
                  if (object.type == 'table') {
                    tableIDs.push(object.name)
                  }
                };
              };
            };
          });
          return tableIDs;
        };

        //initializing function to get table data
        async function getData(tableId) {
          var qTotalData = [];
          let promises = [];

          async function myFunction(model, pageHeight, columns, pageNo) {
            var page = {
              qTop: (pageHeight * (pageNo - 1)),
              qLeft: 0,
              qWidth: columns,
              qHeight: pageHeight,
            };
            let myFunctionVal = await model.getHyperCubeData('/qHyperCubeDef', [page]);
            return myFunctionVal;
          };

          var myArray = [];

          function myCaller(model, numberOfPages, pageHeight, columns, pageNo) {
            if (numberOfPages - pageNo < 0) {
              return myArray;
            };

            myFunction(model, pageHeight, columns, pageNo).then(val =>{
                myArray.push(val)
            });

            return myCaller(model, numberOfPages, pageHeight, columns, pageNo + 1);
          };

          app.getObject(tableId).then(model => {
            let tw = model.layout.qHyperCube.qSize.qcx;
            let th = model.layout.qHyperCube.qSize.qcy;
            // var th = 1000;
            // var totalHeight = model.layout.qHyperCube.qSize.qcy;
            // var columns = 26
            var pageHeight = Math.floor(10000 / tw);
            var numberOfPages = Math.ceil(th / pageHeight);
            console.log('Number of recs/page', pageHeight);
            console.log('Recs', th);
            console.log('Number of pages: ', numberOfPages);
            let pageNo = 1;
            let result = myCaller(model, numberOfPages, pageHeight, tw, pageNo);
            console.log(result)
            console.log('Promise Resolved')
          });
        };

        //initializing function to get table layout
        function tableLayout(tableId) {
          app.getObject(tableId).then(model => {
            model.getLayout().then(data => {
              let tableWidth = data.qHyperCube.qSize.qcx;
              let tableHeight = data.qHyperCube.qSize.qcy;
              console.log('Layout ', tableWidth, tableHeight);
            });
          });
          getData(tableId).then((myTable) => {
            console.log('myTable', myTable)
          });//calling function to get tableData
        };

        //calling function to get table layout
        //tableLayout("BJQnb")   
        let targetElement = document.getElementById('btn');
        targetElement.addEventListener('click', () => {
          let tableID = document.getElementById("my-choice").value;
          getData(tableID)
        });

        $scope.tableIds = tableIds;

      }]
    };

  });
