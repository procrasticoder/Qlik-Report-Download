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
				app.getObject("EPeuAg").then(model => {

                    function getData(){
						var a = [];
						for(let i=0; i<2; i++){
								model.getHyperCubeData('/qHyperCubeDef', [
									{
										"qLeft": 0,
										"qTop": i*6,
										"qWidth": 2,
										"qHeight": 6
									}
								]).then(data =>  a.push(data[0].qMatrix))
							
						}; 
						return a;
                      };

                    model.getLayout().then(data => {
                        let tableWidth = data.qHyperCube.qSize.qcx;
                        let tableHeight = data.qHyperCube.qSize.qcy;
                        console.log('Layout ',tableWidth, tableHeight);
                        console.log(getData());
                    });

			});
			
				return qlik.Promise.resolve()
				
			}
		};

	} );
