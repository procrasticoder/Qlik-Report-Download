define( ["qlik", "text!./template.html"],
	function ( qlik, template ) {

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
			controller: ['$scope', function ( $scope ) {
				//add your rendering code here
				var app = qlik.currApp(this);       //defines app to workon
				var currentSheet = qlik.navigation.getCurrentSheetId();
				var currentSheetId = currentSheet.sheetId;
				var tableIds = getTables(currentSheetId);
				//initializing function to get table data
				function getTables(currentSheetId){
                    let tableIDs = [];
					app.getAppObjectList('sheet', function(reply){
                        for(sheet of reply.qAppObjectList.qItems){
                            if(sheet.qInfo.qId == currentSheetId){
                                for(object of sheet.qData.cells){
                                    if(object.type == 'table'){
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
                    // var model = app.getObject(tableId);
                    // var deferred = $q.defer();
                
                    app.getObject(tableId).then(model =>{
                        model.getHyperCubeData('/qHyperCubeDef', [{qTop: 0, qWidth: 40, qLeft: 0, qHeight: 5}])
                        .then(data => {
                        var columns = model.layout.qHyperCube.qSize.qcx;
                        var totalHeight = model.layout.qHyperCube.qSize.qcy;
                        var pageHeight = 5;
                        var numberOfPages = Math.ceil(totalHeight / pageHeight);
                        console.log('Number of recs/page', 5);
                        console.log('Recs', totalHeight);
                        console.log('Number of pages: ', numberOfPages);
                
                        if (numberOfPages === 1) {
                          if (data.qDataPages) {
                            // Qlik Sense 3.2 SR3
                            Promise.resolve(data.qDataPages[0].qMatrix);
                             
                          } else {
                            Promise.resolve(data[0].qMatrix);
                          }
                        } else {
                          console.log('Started to export data on ', new Date());
                          var promises = Array.apply(null, new Array(numberOfPages)).map(function (data, index) {
                            var page = {
                              qTop: (pageHeight * index) + index,
                              qLeft: 0,
                              qWidth: columns,
                              qHeight: pageHeight,
                              index: index
                            };
                            console.log('page ', (index + 1) + '/' + numberOfPages);
                            return app.getObject(tableId).then(model => {
                                model.getHyperCubeData('/qHyperCubeDef', [page]);  
                            });
                          }, this);
                
                          Promise.all(promises).then(function (data) {
                            for (var j = 0; j < data.length; j++) {
                
                              if (data[j].qDataPages) {
                                // < Qlik Sense 3.2 SR3
                                for (var k1 = 0; k1 < data[j].qDataPages[0].qMatrix.length; k1++) {
                                  qTotalData.push(data[j].qDataPages[0].qMatrix[k1]);
                                }
                              } else {
                                // >= Qlik Sense 3.2 SR3
                                for (var k2 = 0; k2 < data[j][0].qMatrix.length; k2++) {
                                  qTotalData.push(data[j][0].qMatrix[k2]);
                                }
                              }
                            }
                            $scope.log('Finished exporting data on ', new Date());
                            Promise.resolve(qTotalData);
                          });
                        }
                      });
                    });
                    console.log('done and dusted...')
                    return Promise.promise;
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
                        // console.log(myTable)
                    });//calling function to get tableData
                };

                //calling function to get table layout
                //tableLayout("BJQnb")   
				let targetElement = document.getElementById('btn');
				targetElement.addEventListener('click',()=>{
					alert('...')
					let tableID = document.getElementById("my-choice").value;
                    tableLayout(tableID)
				});				
				
				$scope.tableIds = tableIds;

			}]
		};

	} );
