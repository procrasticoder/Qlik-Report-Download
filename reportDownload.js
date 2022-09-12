define( ["qlik"],
	function ( qlik, template ) {

		return {
			template: template,
			support: {
				snapshot: true,
				export: true,
				exportData: false
			},
			paint: function($element, layout) {
				app = qlik.currApp(this);
				app.getObject("JtsghN").then(model => {

                    function getData(tw, th){
						var a = [];
                            model.getHyperCubeData('/qHyperCubeDef', [
                                {
                                    "qLeft": 0,
                                    "qTop": 0,
                                    "qWidth": 2,
                                    "qHeight": 10
                                }]).then(data => {
                                    let myMatrix = [];
                                    for(i=0 ; i<10; i++){
                                        let myRow = [];
                                        for(j=0; j<tw; j++){
                                            myRow.push(data[0].qMatrix[i][j].qText)
                                        }
                                        myMatrix.push(myRow);
                                    };
                                    let myJSONString = JSON.stringify(myMatrix)
                                    console.log(myJSONString)

                                    return myJSONString;
                                })
                    };

                    model.getLayout().then(data => {
                        let tableWidth = data.qHyperCube.qSize.qcx;
                        let tableHeight = data.qHyperCube.qSize.qcy;
                        console.log('Layout ',tableWidth, tableHeight);
                        getData(tableWidth,tableHeight);
                    });

			});
			
				return qlik.Promise.resolve()
				
			}
		};

	} );
