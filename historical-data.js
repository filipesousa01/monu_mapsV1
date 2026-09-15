// Banco de dados em memória para as classes do modelo
// As chaves devem bater exatamente com as classes retornadas pela API (ex: "maria_firmina_busto", "goncalves_dias_rosto")

const historicalDatabase = {
    // ---- ESCRITORES E POETAS ----
    "goncalves_dias_rosto": {
        name: "Antônio Gonçalves Dias",
        period: "1823 - 1864",
        description: "Um dos maiores poetas do romantismo brasileiro. Nascido em Caxias (MA), é o autor da famosa 'Canção do Exílio' ('Minha terra tem palmeiras, onde canta o Sabiá...'). Foi poeta, advogado, jornalista, etnógrafo e teatrólogo.",
        location: "Praça Gonçalves Dias, Centro Histórico"
    },
    "monumento_goncalves_dias": {
        name: "Monumento a Gonçalves Dias",
        period: "1873 (Inauguração)",
        description: "Estátua em homenagem ao poeta Gonçalves Dias, localizada no centro da praça que leva seu nome. É um dos marcos mais tradicionais de São Luís, rodeado por palmeiras que remetem à sua obra mais famosa.",
        location: "Praça Gonçalves Dias"
    },
    "maria_firmina_busto": {
        name: "Maria Firmina dos Reis",
        period: "1822 - 1917",
        description: "Considerada a primeira romancista brasileira. Sua obra 'Úrsula' (1859) é o primeiro romance abolicionista de autoria feminina no Brasil, escrito muito antes da Lei Áurea.",
        location: "Praça Pantheon, Centro Histórico"
    },
    "maria_firmina_rosto": {
        name: "Maria Firmina dos Reis (Rosto)",
        period: "1822 - 1917",
        description: "A autora maranhense foi uma pioneira. Mulher negra, professora e escritora num Brasil imperial escravocrata, usou a literatura como arma contra a escravidão.",
        location: "Maranhão"
    },
    "ferreira_gullar_busto": {
        name: "Ferreira Gullar",
        period: "1930 - 2016",
        description: "Poeta, crítico de arte, tradutor e ensaísta maranhense. Um dos fundadores do neoconcretismo. Seu poema 'Poema Sujo' é considerado uma das obras mais importantes da literatura brasileira contemporânea.",
        location: "São Luís, MA"
    },
    "Ferreira_Gullar_Rosto": {
        name: "Ferreira Gullar",
        period: "1930 - 2016",
        description: "Poeta, crítico de arte, tradutor e ensaísta maranhense. Um dos fundadores do neoconcretismo. Seu poema 'Poema Sujo' é considerado uma das obras mais importantes da literatura brasileira contemporânea.",
        location: "São Luís, MA"
    },
    "artur_azevedo_busto": {
        name: "Artur Azevedo",
        period: "1855 - 1908",
        description: "Dramaturgo, poeta e jornalista maranhense. Foi um dos maiores comediógrafos do Brasil, responsável por popularizar o teatro de revista no país e um dos fundadores da Academia Brasileira de Letras.",
        location: "Teatro Arthur Azevedo (Rua do Sol)"
    },
    "Aluizio_Busto": {
        name: "Aluísio Azevedo",
        period: "1857 - 1913",
        description: "Irmão de Artur Azevedo e autor de clássicos como 'O Mulato' e 'O Cortiço'. Foi o precursor do Naturalismo na literatura brasileira e diplomata em diversos países.",
        location: "Praça Pantheon"
    },
    "josue_montello_Busto": {
        name: "Josué Montello",
        period: "1917 - 2006",
        description: "Jornalista, professor e escritor. Autor de vasta obra sobre a história e cultura maranhense, incluindo 'Os Tambores de São Luís'. Dá nome à principal biblioteca pública estadual.",
        location: "São Luís, MA"
    },
    "humberto_de_campos_busto": {
        name: "Humberto de Campos",
        period: "1886 - 1934",
        description: "Jornalista, político e escritor maranhense. Chegou a ser o escritor mais lido do Brasil nos anos 1930. Ocupou a cadeira 20 da Academia Brasileira de Letras.",
        location: "São Luís, MA"
    },
    "joao_francisco_lisboa": {
        name: "João Francisco Lisboa",
        period: "1812 - 1863",
        description: "Jornalista e historiador, conhecido como o 'Timon Maranhense'. Suas crônicas e estudos históricos são fundamentais para entender a política e sociedade do Maranhão no século XIX.",
        location: "São Luís, MA"
    },
    "manoel_odorico_mendes": {
        name: "Manoel Odorico Mendes",
        period: "1799 - 1866",
        description: "Político, humanista e tradutor maranhense. Foi o primeiro a traduzir Homero (Ilíada e Odisseia) e Virgílio (Eneida) integralmente para a língua portuguesa.",
        location: "Praça Pantheon"
    },
    "sousandrade_busto": {
        name: "Sousandrade (Joaquim de Sousa Andrade)",
        period: "1833 - 1902",
        description: "Poeta maranhense cuja principal obra, 'O Guesa', é considerada precursora do Modernismo e do concretismo, com inovações vocabulares e sintáticas radicais para a época.",
        location: "São Luís, MA"
    },
    "Sousandrade_rosto": {
        name: "Sousandrade",
        period: "1833 - 1902",
        description: "O poeta que desenhou a bandeira do Maranhão republicano e criou poemas tão vanguardistas que só foram compreendidos décadas após sua morte.",
        location: "São Luís, MA"
    },
    "bandeira_tribuzzi_busto": {
        name: "Bandeira Tribuzi",
        period: "1927 - 1977",
        description: "Poeta e jornalista, fundou o modernismo no Maranhão com o livro 'Alguma Existência' (1948). É o autor do hino oficial de São Luís.",
        location: "São Luís, MA"
    },
    
    // ---- MONUMENTOS E LOCAIS ----
    "postePalacio_leoes": {
        name: "Poste do Palácio dos Leões",
        period: "Séc. XIX / XX",
        description: "Poste de iluminação ornamental, elemento do mobiliário urbano histórico no entorno da sede do governo maranhense, refletindo a influência arquitetônica europeia.",
        location: "Palácio dos Leões, Praça Pedro II"
    },
    "leoes": {
        name: "Esculturas dos Leões",
        period: "Séc. XIX",
        description: "Esculturas de bronze que guardam a entrada do Palácio dos Leões. O palácio começou a ser construído em 1612 como forte pelos franceses, e hoje é a sede do Governo do Estado.",
        location: "Palácio dos Leões"
    },
    "pedra_memoria": {
        name: "Pedra da Memória",
        period: "1841",
        description: "Monumento construído originalmente no antigo Campo de Ourique (atual Praça Deodoro) para comemorar a coroação de D. Pedro II. Posteriormente, foi transferido para a Avenida Beira-Mar.",
        location: "Avenida Beira-Mar"
    },
    "fonte_ribeirao": {
        name: "Fonte do Ribeirão",
        period: "1796",
        description: "Construída para fornecer água à população e navios, a Fonte do Ribeirão possui carrancas de pedra por onde jorra água e misteriosos portões de ferro que dão acesso a galerias subterrâneas.",
        location: "Centro Histórico"
    },
    "fonte": {
        name: "Fonte Histórica",
        period: "Período Colonial",
        description: "São Luís possui diversas fontes que abasteciam a cidade antes da água encanada, sendo a das Pedras (onde os franceses acamparam em 1612) e a do Ribeirão as mais famosas.",
        location: "Centro Histórico"
    },
    "pescadores": {
        name: "Monumento aos Pescadores",
        period: "Contemporâneo",
        description: "Monumento que homenageia a classe trabalhadora dos pescadores, intimamente ligada à cultura, culinária e formação socioeconômica do Maranhão litorâneo.",
        location: "Avenida Litorânea / Beira-Mar"
    },
    "canhaoreviver": {
        name: "Canhões do Projeto Reviver",
        period: "Séc XVII - XVIII",
        description: "Antigas peças de artilharia usadas na defesa da cidade contra invasões, hoje integradas à paisagem urbana após a restauração do Centro Histórico (Projeto Reviver).",
        location: "Praia Grande / Cais da Sagração"
    },
    "sereiadosol": {
        name: "Sereia / Lenda da Serpente",
        period: "Folclore Maranhense",
        description: "Uma das lendas mais famosas de São Luís: uma serpente gigante que dorme nas galerias subterrâneas da cidade. Diz a lenda que quando a cabeça (na Fonte do Ribeirão) encontrar o rabo (na Igreja do Carmo), a ilha afundará.",
        location: "São Luís, MA"
    },
    
    // ---- FIGURAS HISTÓRICAS E POLÍTICAS ----
    "daniel_touche": {
        name: "Daniel de La Touche (Senhor de La Ravardière)",
        period: "1570 - 1631",
        description: "Nobre, corsário e colonizador francês. Liderou a expedição que fundou a França Equinocial e a cidade de São Luís em 8 de setembro de 1612.",
        location: "Avenida Pedro II"
    },
    "benedicto_leite": {
        name: "Benedito Leite",
        period: "1857 - 1909",
        description: "Magistrado, político e jornalista maranhense. Foi governador do Maranhão e dá nome a uma das principais praças da cidade, onde está erguida sua estátua.",
        location: "Praça Benedito Leite"
    },
    "urbano_santos_busto": {
        name: "Urbano Santos",
        period: "1859 - 1922",
        description: "Advogado, promotor, juiz e político maranhense. Chegou a ser Vice-Presidente da República do Brasil entre 1914 e 1918.",
        location: "Praça Pantheon"
    },
    "gomes_sousa_busto": {
        name: "Gomes de Sousa",
        period: "1829 - 1889",
        description: "Joaquim Gomes de Sousa foi um brilhante matemático maranhense, considerado um dos pioneiros da matemática pura no Brasil. Foi também deputado e médico.",
        location: "Praça Pantheon"
    }
};

// Função fallback para formatar o nome caso não exista no DB
function formatUnknownClass(className) {
    return className
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(' Busto', '')
        .replace(' Rosto', '');
}

export function getHistoricalData(className) {
    const data = historicalDatabase[className];
    
    if (data) return data;
    
    // Fallback genérico se a classe não estiver mapeada
    return {
        name: formatUnknownClass(className),
        period: "Patrimônio Maranhense",
        description: "Item identificado no acervo histórico do Maranhão. (Descrição detalhada não disponível neste momento).",
        location: "São Luís - MA"
    };
}
