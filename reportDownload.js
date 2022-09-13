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
                function getData(tableName, tw, th) {
                    app.getObject(tableName).then(model => {
                        var a = [];
                        model.getHyperCubeData('/qHyperCubeDef', [
                            {
                                "qLeft": 0,
                                "qTop": 0,
                                "qWidth": 2,
                                "qHeight": 10
                            }]).then(data => {
                                let myMatrix = [];
                                for (i = 0; i < 10; i++) {
                                    let myRow = [];
                                    for (j = 0; j < tw; j++) {
                                        myRow.push(data[0].qMatrix[i][j].qText)
                                    }
                                    myMatrix.push(myRow);
                                };
                                let myJSONString = JSON.stringify(myMatrix)
                                console.log(myJSONString)

                                return myJSONString;
                            })
                    });
                };

                //initializing function to get table layout
                function tableLayout(tableId) {
                    app.getObject(tableId).then(model => {
                        model.getLayout().then(data => {
                            let tableWidth = data.qHyperCube.qSize.qcx;
                            let tableHeight = data.qHyperCube.qSize.qcy;
							console.log(model.layout.title)
                            console.log('Layout ', tableWidth, tableHeight);
                            getData(tableId, tableWidth, tableHeight);        //calling function to get tableData
                        });
                    });
                };

                //calling function to get table layout
                //tableLayout("BJQnb")   
				let targetElement = document.getElementById('btn');
				targetElement.addEventListener('click',()=>{
					let tableID = document.getElementById("my-choice").value;
                    tableLayout(tableID)
				});				
				
				$scope.tablesName = getTables(currentSheetId);

			}]
		};

	} );
