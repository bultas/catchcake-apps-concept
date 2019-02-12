let markup = (some) => {j|
    <div id="app">$some</div>
    <script type="module" src="bundle.js"></script>
|j};

let default = () => markup({j| App will be here |j});