export default ({ data, app }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>${data.name}</title>
        <link href='//fonts.googleapis.com/css?family=Raleway:300,900' rel='stylesheet' type='text/css'>
        <link 
            href='${app.staticURL}/styles.css' 
            rel='stylesheet' 
            type='text/css'
        >
    </head>
    <body>
        <style>
            .image {
                background-image: url("${app.staticURL}/default.jpg");
            }
        </style>
        <div class='wrapper'>
            <div class='container'>
                <div class='imageContainer'>
                    <div class='image'></div>
                </div>
                <div class='contentWrapper'>
                    <div class="contentContainer">
                        <div class="contentCover">
                            <div class='headline'> ${data.name} </div>
                            ${data.content &&
                              `<div class='content'>${data.content}</div>`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};
