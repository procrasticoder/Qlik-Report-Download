define( ["qlik"],
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

				var tableName = 'zPxzuBK';
                let th = 160;
                let tw = 26;
                var tableData = '';
                
                getData(tableName, th, tw)
                
                async function getPromise(data){
                    let strData = JSON.stringify(data);
                    strData;
                    console.log('.')
                };
                

                
                //initializing function to get table data
                function getData(tableName, th, tw) {
                    let rowsPerPage = Math.floor(10000/tw);
                    let pages = Math.floor(th/rowsPerPage);
                    app.getObject(tableName).then(model => {
                        for(i=0; i<=pages; i++){
                            model.getHyperCubeData('/qHyperCubeDef', [{
                                "qLeft": 0,
                                "qTop": i*rowsPerPage,
                                "qWidth": tw,
                                "qHeight": rowsPerPage}
                            ]).then(data => {
                                getPromise(data)
                                // let myMatrix = [];
                                // for (i = 0; i < 10; i++) {
                                //     let myRow = [];
                                //     for (j = 0; j < tw; j++) {
                                //         myRow.push(data[0].qMatrix[i][j].qText)
                                //     }
                                //     myMatrix.push(myRow);
                                // };
                                // let myJSONString = JSON.stringify(myMatrix)
                                // console.log(myJSONString)
                            })
                        };
                    });
                };
			}]
		};

	} );
