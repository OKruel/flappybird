//jshint esversion:6
function novoElemento(tagName, className) {
    const elem = document.createElement(tagName);
    elem.classList.add(className);
    return elem;
}

function Barreira(reversa = false) {
    this.divBarreira = novoElemento('div', 'barreira');
    const borda = novoElemento('div', 'borda');
    const corpo = novoElemento('div', 'corpo');

    this.divBarreira.appendChild(reversa ? corpo : borda);
    this.divBarreira.appendChild(reversa ? borda : corpo);

    this.setAltura = altura => corpo.style.height = `${altura}px`;
}

function ParDeBarreiras(alturaBarreira, passagemPassaro, inicioPosicaoBarreira) {
    this.divParDeBarreiras = novoElemento('div', 'par-de-barreiras');

    this.divBarreiraSuperior = new Barreira(true);
    this.divBarreiraInferior = new Barreira(false);

    this.divParDeBarreiras.appendChild(this.divBarreiraSuperior.divBarreira);
    this.divParDeBarreiras.appendChild(this.divBarreiraInferior.divBarreira);

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (alturaBarreira - passagemPassaro);
        const alturaInferior = alturaBarreira - passagemPassaro - alturaSuperior;

        this.divBarreiraSuperior.setAltura(alturaSuperior);
        this.divBarreiraInferior.setAltura(alturaInferior);
    };

    // Pegando a posicao atual da barreira no eixo X 
    this.getPosicaoAtualEixoX = () => parseInt(this.divParDeBarreiras.style.left.split('px')[0]);
    // Setando a posicao da barreira no eixo X
    this.setPosicaoEixoX = x => this.divParDeBarreiras.style.left = `${x}px`;
    // Pegando a posicao atual da largura da barreira
    this.getLarguraDivParBarreiras = () => this.divParDeBarreiras.clientWidth;

    this.sortearAbertura();
    this.setPosicaoEixoX(inicioPosicaoBarreira);
}

function Barreiras(alturaBarreira, passagemPassaro, inicioPosicaoBarreira, distanciaEntreBarreiras, somarPonto) {
    this.pares = [
        new ParDeBarreiras(alturaBarreira, passagemPassaro, inicioPosicaoBarreira),
        new ParDeBarreiras(alturaBarreira, passagemPassaro, inicioPosicaoBarreira + distanciaEntreBarreiras),
        new ParDeBarreiras(alturaBarreira, passagemPassaro, inicioPosicaoBarreira + distanciaEntreBarreiras * 2),
        new ParDeBarreiras(alturaBarreira, passagemPassaro, inicioPosicaoBarreira + distanciaEntreBarreiras * 3)
    ];

    const deslocamento = 3;
    this.animar = () => {
        this.pares.forEach(par => {
            par.setPosicaoEixoX(par.getPosicaoAtualEixoX() - deslocamento);

            // quando o elemento sair da área do jogo
            if (par.getPosicaoAtualEixoX() < -par.getLarguraDivParBarreiras()) {
                par.setPosicaoEixoX(par.getPosicaoAtualEixoX() + distanciaEntreBarreiras * this.pares.length);
                par.sortearAbertura();
            }
            // quando o elemento atingir o meio da area do jogo
            const meioDivParDeBarreiras = inicioPosicaoBarreira / 2;
            const cruzouOMeio = par.getPosicaoAtualEixoX() + deslocamento >= meioDivParDeBarreiras && par.getPosicaoAtualEixoX() < meioDivParDeBarreiras;
            if (cruzouOMeio) somarPonto();
        });
    };
}

function Passaro(alturaJogo) {    
    this.imgPassaro = novoElemento('img', 'passaro');
    this.imgPassaro.src = './imgs/passaro.png';
    
    this.getPosicaoAtualEixoY = () => parseInt(this.imgPassaro.style.bottom.split('px')[0]);
    this.setPosicaoEixoY = (y) => this.imgPassaro.style.bottom = `${y}px`;
    this.setPosicaoEixoY(alturaJogo / 2);
    
    let voando = false;
    window.onkeydown = (e) => voando = true;
    window.onkeyup = (e) => voando = false;
    
    this.animar = () => {
        const NovaPosicaoEixoY = this.getPosicaoAtualEixoY() + (voando ? 6 : -4);
        
        const alturaMaxima = alturaJogo - this.imgPassaro.clientHeight;
        
        if (NovaPosicaoEixoY <= 0) { this.setPosicaoEixoY(0); }
        else if (NovaPosicaoEixoY >= alturaMaxima) { this.setPosicaoEixoY(alturaMaxima); }
        else { this.setPosicaoEixoY(NovaPosicaoEixoY); }
    };    
}

function Progresso(){
    this.spanPontuacao = novoElemento('span', 'progresso');
    this.atualizarPontos = (pontos) => { this.spanPontuacao.innerHTML = pontos; };
    this.atualizarPontos(0);
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect();
    const b = elementoB.getBoundingClientRect();

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
    return horizontal && vertical;
}

function colidiu(passaro, barreiras) {
    let colidiu = false;
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu) {
            const superior = parDeBarreiras.divBarreiraSuperior.divBarreira;
            const inferior = parDeBarreiras.divBarreiraInferior.divBarreira;
            colidiu = estaoSobrepostos(passaro.imgPassaro, superior) || estaoSobrepostos(passaro.imgPassaro, inferior);
        }
    });
    return colidiu;
}

function FlappyBird() {
    let pontos = 0;
    const areaDoJogo = document.querySelector('[wm-flappy]');
    const alturaBarreira = areaDoJogo.clientHeight;
    const inicioPosicaoBarreira = areaDoJogo.clientWidth;
    
    const pontuacao = new Progresso();
    const barreiras = new Barreiras(alturaBarreira, 200, inicioPosicaoBarreira, 400, () => pontuacao.atualizarPontos(++pontos));
    const passaro = new Passaro(alturaBarreira);    
    
    barreiras.pares.forEach( p => areaDoJogo.appendChild(p.divParDeBarreiras));
    areaDoJogo.appendChild(passaro.imgPassaro);
    areaDoJogo.appendChild(pontuacao.spanPontuacao);
        
    this.start = () => {
        // loop do jogo
        const temporizador = setInterval( () => {
            barreiras.animar();
            passaro.animar();

            
            if(colidiu(passaro, barreiras)){
                clearInterval(temporizador);
            }
            
        }, 20);
    };
}

new FlappyBird().start();

