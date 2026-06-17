import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "pt" | "en";

const STORAGE_KEY = "pso.lang";

// ----------------------------------------------------------------------------
// UI dictionary (per language). Same shape for pt and en.
// ----------------------------------------------------------------------------

const dict = {
  pt: {
    nav: {
      enter: "Entrar",
      playNow: "Jogar agora",
      logout: "Sair",
      players: "Jogadores",
      back: "Voltar",
      step: (a: number, b: number) => `Etapa ${a} de ${b}`,
    },
    landing: {
      badge: "Manager de carreira individual · PvP e cooperativo",
      heroTitlePre: "Da escola de base ao ",
      heroTitleHi: "estrelato mundial",
      heroSubtitle:
        "Pro Soccer Online: crie seu jogador e comece a escrever a sua história rumo ao topo. Sem downloads, jogue de qualquer dispositivo.",
      startCareer: "Começar carreira",
      seeHow: "Ver como funciona",
      overall: "Overall",
      todayGain: "+0.4 hoje",
      live: "AO VIVO",
      heroImgAlt: "Jovem jogador de futebol no estádio iluminado",
      stats: [
        { value: "35", label: "Atributos detalhados" },
        { value: "PvP", label: "e cooperativo" },
        { value: "14", label: "Anos para começar" },
        { value: "6 em 6", label: "Meses por temporada" },
      ],
      journeyKicker: "Sua jornada",
      journeyTitle: "Do garoto ao profissional",
      journeySubtitle:
        "Quatro etapas que definem a sua trajetória dentro do Pro Soccer Online.",
      journey: [
        {
          title: "Comece aos 14 anos",
          desc: "Crie seu jogador do zero e entre na escola de treino. Toda lenda começa pequena.",
        },
        {
          title: "Treine na escola de base",
          desc: "Aprimore atributos, defina sua posição e evolua treino após treino até se destacar.",
        },
        {
          title: "Seja visto por olheiros",
          desc: "Quando você brilha, um olheiro de um time se interessa. Sua chance de ser notado.",
        },
        {
          title: "Aceite e assine contrato",
          desc: "Negocie as condições, treine na base do clube e seja contratado como profissional.",
        },
      ],
      stylesKicker: "Escolha seu estilo",
      stylesTitle: "Qual craque você quer ser?",
      stylesSubtitle: "Defina o DNA do seu jogador e desenvolva atributos únicos.",
      evolveTitle: "Evolua",
      evolveSubtitle:
        "Cada treino e partida aumenta seus atributos e seu score geral rumo ao seu potencial máximo.",
      onlineKicker: "Multiplayer cooperativo",
      onlineTitle: "Evolua online contra o mundo",
      onlineSubtitle:
        "Os times jogam suas rodadas automaticamente e você disputa espaço com jogadores reais. Decida as táticas, conquiste títulos e prove que é o melhor da sua geração.",
      onlineImgAlt: "Jogadores treinando na escola de base",
      onlineFeatures: [
        {
          title: "Times cooperativos",
          desc: "Jogue sozinho com total autonomia ou divida o clube com outros jogadores reais.",
        },
        {
          title: "Votação tática",
          desc: "Antes de cada partida o time vota na formação. Capitão tem voto de desempate.",
        },
        {
          title: "Partidas automáticas",
          desc: "Os jogos acontecem no horário marcado, com ou sem você online. O mundo nunca para.",
        },
        {
          title: "Chat global e do time",
          desc: "Conexão ao vivo com a comunidade, gols em tempo real e vestiário privado do clube.",
        },
      ],
      compsKicker: "Campeonatos reais",
      compsTitle: "Dispute as competições de verdade",
      compsSubtitle:
        "Da base ao profissional, do Brasileirão à Champions e à Copa do Mundo.",
      competitions: [
        {
          region: "🇧🇷 Brasil",
          items: ["Brasileirão Série A", "Copa do Brasil", "Estaduais", "Sub-20 & Copinha"],
        },
        {
          region: "🌍 Mundo",
          items: ["Champions League", "Libertadores", "Copa do Mundo", "Mundial de Clubes"],
        },
      ],
      systemsKicker: "Por dentro do jogo",
      systemsTitle: "Um mundo de futebol completo",
      systemsSubtitle:
        "Simulação realista, temporadas vivas e uma economia que recompensa quem joga de verdade.",
      systems: [
        {
          title: "Simulação justa",
          desc: "Motor com xG, momentum e fator zebra: o favorito nunca passa de 70% de chance.",
        },
        {
          title: "Temporadas vivas",
          desc: "A cada 6 meses elencos e transferências reais são atualizados — sua carreira permanece.",
        },
        {
          title: "Economia de carreira",
          desc: "Salário, bônus por gol e premiações de títulos. Sem dinheiro real: tudo é conquistado jogando.",
        },
        {
          title: "Loja de evolução",
          desc: "Chuteiras, agente, personal trainer e nutricionista para turbinar seus atributos.",
        },
        {
          title: "Marcos de carreira",
          desc: "Primeiro gol, 100 jogos, convocação para a seleção e o cobiçado status de estrela 90+.",
        },
        {
          title: "Clássicos e finais",
          desc: "Jogos decisivos rendem mais XP e definem sua reputação na geração.",
        },
      ],
      ctaTitlePre: "Sua carreira começa ",
      ctaTitleHi: "agora",
      ctaSubtitle:
        "Pro Soccer Online, crie seu jogador e comece a escrever a sua história rumo ao topo. Sem downloads, jogue de qualquer dispositivo.",
      createMyPlayer: "Criar meu jogador",
      footerSecurity: "Segurança e Privacidade",
      footerRights: (y: number) => `© ${y} Pro Soccer Online. Todos os direitos reservados.`,
    },
    presale: {
      badge: "Pré-venda · 50% OFF",
      titlePre: "Garanta seu acesso com ",
      titleHi: "50% de desconto",
      subtitle:
        "Oferta de lançamento por tempo limitado. Quando o contador zerar, o desconto acaba.",
      days: "Dias",
      hours: "Horas",
      min: "Min",
      sec: "Seg",
      grab: "Aproveitar a pré-venda",
      liveBadge: "Comunidade ao vivo",
      liveTitle: "A bola já está rolando",
      liveSubtitle: (price: string) =>
        `Acesso por ${price}. Entre agora e dispute espaço com jogadores do mundo todo.`,
      online: "Jogadores online",
      registered: "Jogadores cadastrados",
      enterNow: "Entrar agora",
    },
    evolution: {
      currentOverall: "Overall atual",
      potential: "Potencial",
      evolution: "Evolução",
      position: "Posição",
      curveTitle: "Curva de evolução do Overall",
      curveRange: "14 → 29 anos",
      tooltipAge: "anos",
      attrsTitle: "Atributos do jogador",
    },
    auth: {
      backToCharacter: "Voltar ao personagem",
      back: "Voltar",
      createAccount: "Crie sua conta",
      enter: "Entrar",
      createSubtitle: "Crie sua conta para salvar seu jogador e iniciar a carreira.",
      enterSubtitle: "Entre para continuar sua carreira.",
      notRobot: "Não sou um robô",
      security: "Security",
      iAgreePre: "Eu li e concordo com os ",
      terms: "termos de uso",
      iAgreePost: " do Pro Soccer Online.",
      continueGoogle: "Continuar com Google",
      continueApple: "Continuar com Apple",
      termsTitle: "Termos de Uso",
      termsAccept: "Entendi e Aceito",
      acceptError: "Por favor, aceite os termos e confirme que não é um robô para continuar.",
      signInFail: "Falha ao entrar. Tente novamente.",
      captchaDone: "Verificação concluída com sucesso!",
      nameTaken: "Esse nome de jogador já está em uso. Escolha outro para continuar.",
      termsBody: [
        {
          h: "",
          p: "Bem-vindo ao Pro Soccer Online! Este é um manager de carreira individual desenvolvido para entretenimento. Ao criar sua conta ou fazer login, você concorda e aceita integralmente as regras e termos descritos abaixo.",
        },
        {
          h: "1. Cadastro e Contas",
          p: "Para salvar sua carreira, criar personagens e disputar as partidas, você deve se cadastrar utilizando um método de autenticação válido (Google ou Apple). É permitida apenas uma conta ativa por jogador. O uso de bots, scripts de automação ou hacks é expressamente proibido e resultará na suspensão permanente da conta.",
        },
        {
          h: "2. Economia do Jogo",
          p: "Todos os salários, bônus por gol, premiações e itens disponíveis na loja são fictícios e adquiridos exclusivamente por meio da jogabilidade. Nenhum recurso dentro do jogo possui valor monetário real, e a compra ou venda de contas e recursos por dinheiro externo é proibida.",
        },
        {
          h: "3. Conduta do Jogador",
          p: "Esperamos que todos mantenham um ambiente esportivo e respeitoso. Comportamentos tóxicos, discursos de ódio no chat global, ofensas no vestiário ou tentativas de jogar de má-fé estão sujeitos a moderação e banimento.",
        },
        {
          h: "4. Modificações no Serviço",
          p: "O Pro Soccer Online poderá realizar atualizações, rebalanceamentos de atributos ou redefinições sazonais de ligas a fim de garantir uma simulação competitiva e divertida para toda a comunidade.",
        },
        {
          h: "5. Privacidade e Dados",
          p: "Coletamos dados de autenticação exclusivamente para gerenciar seu acesso e salvar o progresso dos seus jogadores. Seus dados nunca serão compartilhados ou vendidos.",
        },
      ],
    },
    create: {
      steps: ["Identidade", "Atributos", "Resumo"],
      step0Title: "Quem é o seu craque?",
      step0Subtitle:
        "Toda lenda começa aos 14 anos. Físico, posição e nacionalidade já moldam seus atributos.",
      nameLabel: "Nome do jogador (único)",
      namePlaceholder: "Ex: João Silva",
      nameTaken: "Esse nome já está em uso. Escolha outro.",
      nameShort: "O nome precisa ter ao menos 3 letras.",
      nameOk: "Nome disponível!",
      nameHint: "Nomes de jogador não podem se repetir no Pro Soccer Online.",
      nationality: "Nacionalidade",
      preferredFoot: "Pé preferido",
      mainPosition: "Posição principal",
      secondaryPositions: "Posições secundárias (até 2)",
      height: (cm: number) => `Altura: ${cm} cm`,
      heightHint: "Mais alto: + força, impulsão e cabeceio · − agilidade e ritmo",
      weight: (kg: number) => `Peso: ${kg} kg`,
      weightHint: "Mais pesado: + força e combatividade · − aceleração e fôlego",
      step1Title: "Estilo e atributos",
      step1Subtitle: (pts: number, cap: number) =>
        `Cada posição e estilo já dá atributos específicos. Distribua ${pts} pontos extras com inteligência — o overall muda ao vivo (máx. ${cap}).`,
      playStyle: "Estilo de jogo",
      skillsWeakFoot: "Fintas e pé ruim",
      starsLeft: (n: number) => `${n} estrela(s) restante(s)`,
      starsHint: (pool: number) =>
        `Todos começam com 1 estrela em cada — evoluem durante o jogo. Você tem ${pool} para distribuir agora.`,
      skillMoves: "Fintas",
      weakFoot: "Pé ruim",
      attrs35: "Atributos (35)",
      ptsLeft: (n: number) => `${n} pts restantes`,
      reduce: (l: string) => `Reduzir ${l}`,
      increase: (l: string) => `Aumentar ${l}`,
      step2Title: "Seu craque está pronto!",
      step2Subtitle: "Revise os detalhes e crie sua conta para começar a carreira.",
      overall: "Overall",
      potential: "Potencial",
      position: "Posição",
      secPositions: "Posições sec.",
      style: "Estilo",
      age: "Idade",
      ageYears: (n: number) => `${n} anos`,
      heightWeight: "Altura / Peso",
      foot: "Pé preferido",
      skillsWeak: "Fintas / Pé ruim",
      detailedAttrs: "Atributos detalhados",
      back: "Voltar",
      continue: "Continuar",
      createAndStart: "Criar conta e começar",
      validateNameFail: "Não foi possível validar o nome. Tente novamente.",
      playerCreated: "Jogador criado!",
      baseHint: (base: number, cap: number) =>
        `Base fixa de ${base} por atributo. Quem distribui com inteligência chega a ${cap}.`,
    },
    players: {
      title: "Jogadores",
      noPlayerTitle: "Você ainda não tem um jogador",
      noPlayerSubtitle: "Crie seu craque para iniciar sua carreira.",
      createPlayer: "Criar jogador",
      hello: (name: string) => `Olá, ${name} 👋`,
      careerOf: "Carreira de",
      myCareer: "Minha Carreira",
      createAnother: "Criar outro jogador",
      deletePlayer: "Excluir jogador",
      overall: "Overall",
      potential: "Potencial",
      age: "Idade",
      ageYears: (n: number) => `${n} anos`,
      position: "Posição",
      playerAttrs: "Atributos do jogador",
      nextSteps: "Próximos passos",
      next: [
        { title: "Treinar", desc: "Evolua atributos, fintas e pé ruim na escola de base." },
        { title: "Ser observado", desc: "Brilhe para atrair olheiros dos clubes." },
        { title: "Temporada", desc: "Dispute partidas PvP e cooperativas e marque sua história." },
      ],
      deleteTitle: "Excluir jogador",
      deleteDescPre: "Esta ação é permanente e não pode ser desfeita",
      deleteDescPlayer: (name: string) => ` — o jogador ${name} será apagado`,
      deleteDescPost: "Digite CONFIRMAR para avançar.",
      confirmation: "Confirmação",
      confirmWord: "CONFIRMAR",
      cancel: "Cancelar",
      deleteForever: "Excluir definitivamente",
      deleteError: "Não foi possível excluir o jogador. Tente novamente.",
      deleted: "Jogador excluído.",
    },
    career: {
      back: "Jogadores",
      notFoundTitle: "Jogador não encontrado",
      notFoundSubtitle: "Este jogador não existe ou não pertence à sua conta.",
      backToPlayers: "Voltar aos jogadores",
      myCareer: "Minha Carreira",
      individualNote: "Carreira individual — esta evolução pertence apenas a este jogador.",
      playerSheet: "Ficha do jogador",
      nationality: "Nacionalidade",
      position: "Posição",
      preferredFoot: "Pé preferido",
      height: "Altura",
      weight: "Peso",
      style: "Estilo",
      sinceBase: "Na base desde",
      overall: "Overall",
      potential: "Potencial",
      age: "Idade",
      ageYears: (n: number) => `${n} anos`,
      margin: "Margem",
      fullAttrs: "Atributos completos",
      playStyle: "Estilo de jogo",
      dateLocale: "pt-BR",
    },
    awaiting: {
      backToLogin: "Voltar ao login",
      title: "Confirme seu e-mail",
      sentPre: "Enviamos um link de confirmação",
      forText: " para ",
      sentNote:
        "Abra seu e-mail e clique no link para ativar sua conta. Esta página redireciona sozinha assim que a confirmação for concluída.",
      waiting: "Aguardando confirmação...",
      resend: "Reenviar e-mail de confirmação",
      noEmail: "Não encontramos seu e-mail. Faça o cadastro novamente.",
      resendFail: "Não foi possível reenviar. Tente em alguns instantes.",
      resent: "E-mail de confirmação reenviado!",
      confirmed: "E-mail confirmado! Bem-vindo ao Pro Soccer Online.",
    },
    payment: {
      home: "Início",
      lifetime: "Acesso vitalício",
      title: "Libere seu acesso",
      subtitle:
        "Pague via Pix para liberar sua carreira no Pro Soccer Online. A confirmação é automática.",
      method: "Forma de pagamento",
      comingSoon: "Em breve",
      fullName: "Nome completo",
      namePlaceholder: "Seu nome",
      generatePix: "Gerar Pix",
      payWithPix: "Pague com Pix",
      pixSubtitle: (amount: string) =>
        `Escaneie o QR Code${amount} ou copie o código abaixo. A liberação é automática após o pagamento.`,
      pixCopy: "Pix copia e cola",
      awaiting: "Aguardando confirmação do pagamento...",
      pixGenerated: "Pix gerado! Escaneie ou copie o código para pagar.",
      pixError: "Não foi possível gerar o Pix. Verifique os dados e tente novamente.",
    },
    security: {
      back: "Voltar",
      kicker: "Confiança e proteção",
      title: "Segurança e Privacidade",
      intro:
        "Esta página é mantida pela equipe do Pro Soccer Online para explicar, de forma simples, as principais práticas de segurança e privacidade do jogo. Ela descreve controles atualmente ativos no aplicativo e pode ser atualizada conforme o jogo evolui.",
      controls: [
        {
          title: "Autenticação de conta",
          desc: "O acesso é protegido por login com e-mail e senha (e provedores sociais quando habilitados). Cada pessoa só acessa a própria conta após autenticação.",
        },
        {
          title: "Banco de dados com regras de acesso",
          desc: "Os dados ficam em um banco de dados gerenciado na nuvem com regras de acesso por linha (Row-Level Security). Cada usuário só consegue ler e gerenciar os próprios registros.",
        },
        {
          title: "Cálculos no servidor (anti-trapaça)",
          desc: "Atributos, overall e progressão do jogador são calculados exclusivamente no servidor. O aplicativo nunca confia em valores enviados pelo navegador, dificultando o uso de ferramentas de trapaça.",
        },
        {
          title: "Escrita apenas pelo servidor",
          desc: "A criação e a alteração de dados sensíveis do jogo (jogadores, assinaturas e cargos) acontecem apenas por funções de servidor confiáveis — não é possível editar esses dados diretamente.",
        },
        {
          title: "Pagamentos Pix",
          desc: "Os pagamentos via Pix são processados por um provedor de pagamentos parceiro. A confirmação chega ao jogo por um canal de notificação verificado. Não armazenamos dados de cartão.",
        },
        {
          title: "Comunicação por e-mail",
          desc: "E-mails do sistema (como confirmação de conta) são enviados por filas no servidor. Você pode solicitar o cancelamento de comunicações a qualquer momento.",
        },
        {
          title: "Seus dados, seu controle",
          desc: "Você pode visualizar e excluir o seu jogador dentro do aplicativo. Para solicitar a remoção da conta e dos dados associados, entre em contato com a equipe.",
        },
      ],
      sharedTitle: "Responsabilidade compartilhada",
      sharedBody:
        "A segurança envolve diferentes partes. A infraestrutura de nuvem que hospeda o jogo oferece recursos de plataforma, como conexões criptografadas em trânsito (HTTPS) e um banco de dados gerenciado. A equipe do Pro Soccer Online é responsável pelas regras de acesso, pela lógica do jogo no servidor e pelo tratamento dos dados dentro do aplicativo. Você, como jogador, ajuda mantendo sua senha em segredo e usando uma senha forte e exclusiva.",
      reportTitle: "Relatar um problema de segurança",
      reportBody:
        "Encontrou uma possível falha de segurança ou tem dúvidas sobre privacidade? Entre em contato com a equipe do Pro Soccer Online pelos canais oficiais de suporte. Pedimos que você não divulgue publicamente o problema antes de nos dar a oportunidade de corrigi-lo.",
      disclaimer:
        "Conteúdo informativo mantido pela equipe do Pro Soccer Online. Não constitui certificação independente nem garantia legal. As práticas podem mudar; consulte esta página para a versão mais recente.",
      rights: (y: number) => `© ${y} Pro Soccer Online. Todos os direitos reservados.`,
    },
    card: {
      yourPlayer: "Seu Craque",
      skillMoves: "Fintas",
      weakFoot: "Pé ruim",
      goodFoot: "Pé bom",
    },
  },

  en: {
    nav: {
      enter: "Sign in",
      playNow: "Play now",
      logout: "Log out",
      players: "Players",
      back: "Back",
      step: (a: number, b: number) => `Step ${a} of ${b}`,
    },
    landing: {
      badge: "Individual career manager · PvP and co-op",
      heroTitlePre: "From the academy to ",
      heroTitleHi: "world stardom",
      heroSubtitle:
        "Pro Soccer Online: create your player and start writing your story to the top. No downloads, play from any device.",
      startCareer: "Start career",
      seeHow: "See how it works",
      overall: "Overall",
      todayGain: "+0.4 today",
      live: "LIVE",
      heroImgAlt: "Young soccer player in the floodlit stadium",
      stats: [
        { value: "35", label: "Detailed attributes" },
        { value: "PvP", label: "and co-op" },
        { value: "14", label: "Age to start" },
        { value: "Every 6", label: "Months per season" },
      ],
      journeyKicker: "Your journey",
      journeyTitle: "From kid to professional",
      journeySubtitle: "Four stages that define your path inside Pro Soccer Online.",
      journey: [
        {
          title: "Start at age 14",
          desc: "Create your player from scratch and join the training academy. Every legend starts small.",
        },
        {
          title: "Train at the academy",
          desc: "Improve attributes, set your position and evolve training after training until you stand out.",
        },
        {
          title: "Get noticed by scouts",
          desc: "When you shine, a club scout takes interest. Your chance to be noticed.",
        },
        {
          title: "Accept and sign a contract",
          desc: "Negotiate terms, train at the club academy and get signed as a professional.",
        },
      ],
      stylesKicker: "Choose your style",
      stylesTitle: "Which star do you want to be?",
      stylesSubtitle: "Define your player's DNA and develop unique attributes.",
      evolveTitle: "Evolve",
      evolveSubtitle:
        "Every training and match boosts your attributes and your overall score toward your maximum potential.",
      onlineKicker: "Co-op multiplayer",
      onlineTitle: "Evolve online against the world",
      onlineSubtitle:
        "Teams play their rounds automatically and you compete for a spot with real players. Decide the tactics, win titles and prove you are the best of your generation.",
      onlineImgAlt: "Players training at the academy",
      onlineFeatures: [
        {
          title: "Co-op teams",
          desc: "Play solo with full autonomy or share the club with other real players.",
        },
        {
          title: "Tactical voting",
          desc: "Before each match the team votes on the formation. The captain casts the tiebreaker.",
        },
        {
          title: "Automatic matches",
          desc: "Games happen at the scheduled time, with or without you online. The world never stops.",
        },
        {
          title: "Global and team chat",
          desc: "Live connection with the community, real-time goals and a private club locker room.",
        },
      ],
      compsKicker: "Real competitions",
      compsTitle: "Play the real competitions",
      compsSubtitle:
        "From the academy to the pros, from the league to the Champions and the World Cup.",
      competitions: [
        {
          region: "🇧🇷 Brazil",
          items: ["Brasileirão Série A", "Copa do Brasil", "State leagues", "U-20 & Cup"],
        },
        {
          region: "🌍 World",
          items: ["Champions League", "Libertadores", "World Cup", "Club World Cup"],
        },
      ],
      systemsKicker: "Inside the game",
      systemsTitle: "A complete soccer world",
      systemsSubtitle:
        "Realistic simulation, living seasons and an economy that rewards those who really play.",
      systems: [
        {
          title: "Fair simulation",
          desc: "Engine with xG, momentum and upset factor: the favorite never exceeds a 70% chance.",
        },
        {
          title: "Living seasons",
          desc: "Every 6 months real squads and transfers are updated — your career remains.",
        },
        {
          title: "Career economy",
          desc: "Salary, goal bonuses and title prizes. No real money: everything is earned by playing.",
        },
        {
          title: "Evolution shop",
          desc: "Boots, agent, personal trainer and nutritionist to boost your attributes.",
        },
        {
          title: "Career milestones",
          desc: "First goal, 100 games, national team call-up and the coveted 90+ star status.",
        },
        {
          title: "Derbies and finals",
          desc: "Decisive games grant more XP and define your reputation in the generation.",
        },
      ],
      ctaTitlePre: "Your career starts ",
      ctaTitleHi: "now",
      ctaSubtitle:
        "Pro Soccer Online, create your player and start writing your story to the top. No downloads, play from any device.",
      createMyPlayer: "Create my player",
      footerSecurity: "Security & Privacy",
      footerRights: (y: number) => `© ${y} Pro Soccer Online. All rights reserved.`,
    },
    presale: {
      badge: "Pre-sale · 50% OFF",
      titlePre: "Secure your access with ",
      titleHi: "50% off",
      subtitle:
        "Limited-time launch offer. When the timer hits zero, the discount ends.",
      days: "Days",
      hours: "Hours",
      min: "Min",
      sec: "Sec",
      grab: "Grab the pre-sale",
      liveBadge: "Live community",
      liveTitle: "The ball is already rolling",
      liveSubtitle: (price: string) =>
        `Access for ${price}. Join now and compete for a spot with players from all over the world.`,
      online: "Players online",
      registered: "Registered players",
      enterNow: "Join now",
    },
    evolution: {
      currentOverall: "Current overall",
      potential: "Potential",
      evolution: "Growth",
      position: "Position",
      curveTitle: "Overall evolution curve",
      curveRange: "Age 14 → 29",
      tooltipAge: "yrs",
      attrsTitle: "Player attributes",
    },
    auth: {
      backToCharacter: "Back to character",
      back: "Back",
      createAccount: "Create your account",
      enter: "Sign in",
      createSubtitle: "Create your account to save your player and start your career.",
      enterSubtitle: "Sign in to continue your career.",
      notRobot: "I'm not a robot",
      security: "Security",
      iAgreePre: "I have read and agree to the ",
      terms: "terms of use",
      iAgreePost: " of Pro Soccer Online.",
      continueGoogle: "Continue with Google",
      continueApple: "Continue with Apple",
      termsTitle: "Terms of Use",
      termsAccept: "I understand and accept",
      acceptError: "Please accept the terms and confirm you are not a robot to continue.",
      signInFail: "Sign-in failed. Please try again.",
      captchaDone: "Verification completed successfully!",
      nameTaken: "This player name is already in use. Choose another to continue.",
      termsBody: [
        {
          h: "",
          p: "Welcome to Pro Soccer Online! This is an individual career manager built for entertainment. By creating your account or signing in, you fully agree to and accept the rules and terms described below.",
        },
        {
          h: "1. Registration and Accounts",
          p: "To save your career, create characters and play matches, you must register using a valid authentication method (Google or Apple). Only one active account per player is allowed. The use of bots, automation scripts or hacks is strictly prohibited and will result in permanent account suspension.",
        },
        {
          h: "2. Game Economy",
          p: "All salaries, goal bonuses, prizes and items available in the shop are fictional and acquired exclusively through gameplay. No in-game resource has real monetary value, and buying or selling accounts and resources for external money is prohibited.",
        },
        {
          h: "3. Player Conduct",
          p: "We expect everyone to keep a sporting and respectful environment. Toxic behavior, hate speech in global chat, offenses in the locker room or attempts to play in bad faith are subject to moderation and banning.",
        },
        {
          h: "4. Service Changes",
          p: "Pro Soccer Online may carry out updates, attribute rebalancing or seasonal league resets to ensure a competitive and fun simulation for the whole community.",
        },
        {
          h: "5. Privacy and Data",
          p: "We collect authentication data exclusively to manage your access and save your players' progress. Your data will never be shared or sold.",
        },
      ],
    },
    create: {
      steps: ["Identity", "Attributes", "Summary"],
      step0Title: "Who is your star?",
      step0Subtitle:
        "Every legend starts at age 14. Physique, position and nationality already shape your attributes.",
      nameLabel: "Player name (unique)",
      namePlaceholder: "e.g. John Smith",
      nameTaken: "This name is already in use. Choose another.",
      nameShort: "The name must be at least 3 letters.",
      nameOk: "Name available!",
      nameHint: "Player names cannot repeat in Pro Soccer Online.",
      nationality: "Nationality",
      preferredFoot: "Preferred foot",
      mainPosition: "Main position",
      secondaryPositions: "Secondary positions (up to 2)",
      height: (cm: number) => `Height: ${cm} cm`,
      heightHint: "Taller: + strength, jumping and heading · − agility and pace",
      weight: (kg: number) => `Weight: ${kg} kg`,
      weightHint: "Heavier: + strength and aggression · − acceleration and stamina",
      step1Title: "Style and attributes",
      step1Subtitle: (pts: number, cap: number) =>
        `Each position and style already grants specific attributes. Distribute ${pts} extra points wisely — the overall changes live (max ${cap}).`,
      playStyle: "Play style",
      skillsWeakFoot: "Skill moves and weak foot",
      starsLeft: (n: number) => `${n} star(s) left`,
      starsHint: (pool: number) =>
        `Everyone starts with 1 star in each — they grow during the game. You have ${pool} to distribute now.`,
      skillMoves: "Skill moves",
      weakFoot: "Weak foot",
      attrs35: "Attributes (35)",
      ptsLeft: (n: number) => `${n} pts left`,
      reduce: (l: string) => `Decrease ${l}`,
      increase: (l: string) => `Increase ${l}`,
      step2Title: "Your star is ready!",
      step2Subtitle: "Review the details and create your account to start your career.",
      overall: "Overall",
      potential: "Potential",
      position: "Position",
      secPositions: "Sec. positions",
      style: "Style",
      age: "Age",
      ageYears: (n: number) => `${n} yrs`,
      heightWeight: "Height / Weight",
      foot: "Preferred foot",
      skillsWeak: "Skills / Weak foot",
      detailedAttrs: "Detailed attributes",
      back: "Back",
      continue: "Continue",
      createAndStart: "Create account and start",
      validateNameFail: "Could not validate the name. Please try again.",
      playerCreated: "Player created!",
      baseHint: (base: number, cap: number) =>
        `Fixed base of ${base} per attribute. Those who distribute wisely reach ${cap}.`,
    },
    players: {
      title: "Players",
      noPlayerTitle: "You don't have a player yet",
      noPlayerSubtitle: "Create your star to begin your career.",
      createPlayer: "Create player",
      hello: (name: string) => `Hi, ${name} 👋`,
      careerOf: "Career of",
      myCareer: "My Career",
      createAnother: "Create another player",
      deletePlayer: "Delete player",
      overall: "Overall",
      potential: "Potential",
      age: "Age",
      ageYears: (n: number) => `${n} yrs`,
      position: "Position",
      playerAttrs: "Player attributes",
      nextSteps: "Next steps",
      next: [
        { title: "Train", desc: "Evolve attributes, skill moves and weak foot at the academy." },
        { title: "Get scouted", desc: "Shine to attract club scouts." },
        { title: "Season", desc: "Play PvP and co-op matches and make your story." },
      ],
      deleteTitle: "Delete player",
      deleteDescPre: "This action is permanent and cannot be undone",
      deleteDescPlayer: (name: string) => ` — the player ${name} will be erased`,
      deleteDescPost: "Type CONFIRM to proceed.",
      confirmation: "Confirmation",
      confirmWord: "CONFIRM",
      cancel: "Cancel",
      deleteForever: "Delete permanently",
      deleteError: "Could not delete the player. Please try again.",
      deleted: "Player deleted.",
    },
    career: {
      back: "Players",
      notFoundTitle: "Player not found",
      notFoundSubtitle: "This player doesn't exist or doesn't belong to your account.",
      backToPlayers: "Back to players",
      myCareer: "My Career",
      individualNote: "Individual career — this progress belongs only to this player.",
      playerSheet: "Player sheet",
      nationality: "Nationality",
      position: "Position",
      preferredFoot: "Preferred foot",
      height: "Height",
      weight: "Weight",
      style: "Style",
      sinceBase: "At the academy since",
      overall: "Overall",
      potential: "Potential",
      age: "Age",
      ageYears: (n: number) => `${n} yrs`,
      margin: "Margin",
      fullAttrs: "Full attributes",
      playStyle: "Play style",
      dateLocale: "en-US",
    },
    awaiting: {
      backToLogin: "Back to sign in",
      title: "Confirm your email",
      sentPre: "We sent a confirmation link",
      forText: " to ",
      sentNote:
        "Open your email and click the link to activate your account. This page redirects automatically once the confirmation is complete.",
      waiting: "Waiting for confirmation...",
      resend: "Resend confirmation email",
      noEmail: "We couldn't find your email. Please register again.",
      resendFail: "Could not resend. Please try again shortly.",
      resent: "Confirmation email resent!",
      confirmed: "Email confirmed! Welcome to Pro Soccer Online.",
    },
    payment: {
      home: "Home",
      lifetime: "Lifetime access",
      title: "Unlock your access",
      subtitle:
        "Pay via Pix to unlock your career in Pro Soccer Online. Confirmation is automatic.",
      method: "Payment method",
      comingSoon: "Coming soon",
      fullName: "Full name",
      namePlaceholder: "Your name",
      generatePix: "Generate Pix",
      payWithPix: "Pay with Pix",
      pixSubtitle: (amount: string) =>
        `Scan the QR Code${amount} or copy the code below. Access is automatic after payment.`,
      pixCopy: "Pix copy & paste",
      awaiting: "Waiting for payment confirmation...",
      pixGenerated: "Pix generated! Scan or copy the code to pay.",
      pixError: "Could not generate the Pix. Check the details and try again.",
    },
    security: {
      back: "Back",
      kicker: "Trust and protection",
      title: "Security & Privacy",
      intro:
        "This page is maintained by the Pro Soccer Online team to explain, in simple terms, the main security and privacy practices of the game. It describes controls currently active in the app and may be updated as the game evolves.",
      controls: [
        {
          title: "Account authentication",
          desc: "Access is protected by email and password login (and social providers when enabled). Each person only accesses their own account after authentication.",
        },
        {
          title: "Database with access rules",
          desc: "Data is kept in a managed cloud database with row-level access rules (Row-Level Security). Each user can only read and manage their own records.",
        },
        {
          title: "Server-side calculations (anti-cheat)",
          desc: "Attributes, overall and player progression are calculated exclusively on the server. The app never trusts values sent by the browser, making cheating tools harder to use.",
        },
        {
          title: "Server-only writes",
          desc: "Creating and changing sensitive game data (players, subscriptions and roles) only happens through trusted server functions — this data cannot be edited directly.",
        },
        {
          title: "Pix payments",
          desc: "Pix payments are processed by a partner payment provider. Confirmation reaches the game through a verified notification channel. We do not store card data.",
        },
        {
          title: "Email communication",
          desc: "System emails (such as account confirmation) are sent through server queues. You can request to opt out of communications at any time.",
        },
        {
          title: "Your data, your control",
          desc: "You can view and delete your player within the app. To request removal of your account and associated data, contact the team.",
        },
      ],
      sharedTitle: "Shared responsibility",
      sharedBody:
        "Security involves different parties. The cloud infrastructure that hosts the game provides platform features such as encrypted connections in transit (HTTPS) and a managed database. The Pro Soccer Online team is responsible for access rules, server-side game logic and handling of data within the app. You, as a player, help by keeping your password secret and using a strong, unique password.",
      reportTitle: "Report a security issue",
      reportBody:
        "Found a possible security flaw or have privacy questions? Contact the Pro Soccer Online team through the official support channels. We ask that you not publicly disclose the issue before giving us the opportunity to fix it.",
      disclaimer:
        "Informational content maintained by the Pro Soccer Online team. It is not an independent certification or legal guarantee. Practices may change; check this page for the latest version.",
      rights: (y: number) => `© ${y} Pro Soccer Online. All rights reserved.`,
    },
    card: {
      yourPlayer: "Your Star",
      skillMoves: "Skills",
      weakFoot: "Weak foot",
      goodFoot: "Strong foot",
    },
  },
} as const;

// ----------------------------------------------------------------------------
// Game-data translation maps (keyed by stable canonical values)
// ----------------------------------------------------------------------------

const ATTR_EN: Record<string, string> = {
  acceleration: "Acceleration",
  sprintSpeed: "Sprint Speed",
  positioning: "Positioning",
  finishing: "Finishing",
  shotPower: "Shot Power",
  longShots: "Long Shots",
  volleys: "Volleys",
  penalties: "Penalties",
  vision: "Vision",
  crossing: "Crossing",
  fkAccuracy: "FK Accuracy",
  shortPassing: "Short Passing",
  longPassing: "Long Passing",
  curve: "Curve",
  agility: "Agility",
  balance: "Balance",
  reactions: "Reactions",
  ballControl: "Ball Control",
  dribbling: "Dribbling",
  composure: "Composure",
  interceptions: "Interceptions",
  headingAccuracy: "Heading",
  defAwareness: "Defensive Awareness",
  standingTackle: "Standing Tackle",
  slidingTackle: "Sliding Tackle",
  jumping: "Jumping",
  stamina: "Stamina",
  strength: "Strength",
  aggression: "Aggression",
  gkDiving: "Diving",
  gkHandling: "Handling",
  gkKicking: "Kicking",
  gkReflexes: "Reflexes",
  gkSpeed: "Speed (GK)",
  gkPositioning: "Positioning (GK)",
};

const CAT_EN: Record<string, string> = {
  pace: "Pace",
  shooting: "Shooting",
  passing: "Passing",
  dribbling: "Dribbling",
  defending: "Defending",
  physical: "Physical",
  goalkeeping: "Goalkeeping",
};

const CAT_SHORT_EN: Record<string, string> = {
  pace: "PAC",
  shooting: "SHO",
  passing: "PAS",
  dribbling: "DRI",
  defending: "DEF",
  physical: "PHY",
  goalkeeping: "GK",
};

const POS_EN: Record<string, string> = {
  GOL: "Goalkeeper",
  ZAG: "Center Back",
  LD: "Right Back",
  LE: "Left Back",
  VOL: "Defensive Mid",
  MC: "Central Mid",
  MEI: "Attacking Mid",
  PD: "Right Winger",
  PE: "Left Winger",
  SA: "Second Striker",
  ATA: "Striker",
};

const STYLE_EN: Record<string, { name: string; desc: string }> = {
  Velocista: { name: "Speedster", desc: "Burst and dribbling on the wings" },
  Artilheiro: { name: "Goal Poacher", desc: "Nose for goal inside the box" },
  Maestro: { name: "Playmaker", desc: "Vision and decisive passing" },
  Muralha: { name: "Wall", desc: "Strength and tackling in defense" },
  Goleiro: { name: "Goalkeeper", desc: "Reflexes and safety in goal" },
  "Box-to-box": { name: "Box-to-box", desc: "Energy from attack to defense" },
};

const FOOT_EN: Record<string, string> = {
  Direito: "Right",
  Esquerdo: "Left",
};

const NAT_EN: Record<string, string> = {
  "🇺🇸 Estados Unidos": "🇺🇸 United States",
  "🇨🇦 Canadá": "🇨🇦 Canada",
  "🇲🇽 México": "🇲🇽 Mexico",
  "🇧🇷 Brasil": "🇧🇷 Brazil",
  "🇦🇷 Argentina": "🇦🇷 Argentina",
  "🇺🇾 Uruguai": "🇺🇾 Uruguay",
  "🇨🇴 Colômbia": "🇨🇴 Colombia",
  "🇪🇨 Equador": "🇪🇨 Ecuador",
  "🇵🇾 Paraguai": "🇵🇾 Paraguay",
  "🇵🇪 Peru": "🇵🇪 Peru",
  "🇻🇪 Venezuela": "🇻🇪 Venezuela",
  "🇨🇱 Chile": "🇨🇱 Chile",
  "🇧🇴 Bolívia": "🇧🇴 Bolivia",
  "🇫🇷 França": "🇫🇷 France",
  "🇬🇧 Inglaterra": "🇬🇧 England",
  "🇪🇸 Espanha": "🇪🇸 Spain",
  "🇵🇹 Portugal": "🇵🇹 Portugal",
  "🇩🇪 Alemanha": "🇩🇪 Germany",
  "🇮🇹 Itália": "🇮🇹 Italy",
  "🇳🇱 Holanda": "🇳🇱 Netherlands",
  "🇧🇪 Bélgica": "🇧🇪 Belgium",
  "🇭🇷 Croácia": "🇭🇷 Croatia",
  "🇨🇭 Suíça": "🇨🇭 Switzerland",
  "🇩🇰 Dinamarca": "🇩🇰 Denmark",
  "🇦🇹 Áustria": "🇦🇹 Austria",
  "🇵🇱 Polônia": "🇵🇱 Poland",
  "🇷🇸 Sérvia": "🇷🇸 Serbia",
  "🇹🇷 Turquia": "🇹🇷 Turkey",
  "🇳🇴 Noruega": "🇳🇴 Norway",
  "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escócia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland",
  "🏴 Escócia": "🏴 Scotland",
  "🇺🇦 Ucrânia": "🇺🇦 Ukraine",
  "🇨🇿 Tchéquia": "🇨🇿 Czechia",
  "🇸🇪 Suécia": "🇸🇪 Sweden",
  "🇲🇦 Marrocos": "🇲🇦 Morocco",
  "🇸🇳 Senegal": "🇸🇳 Senegal",
  "🇳🇬 Nigéria": "🇳🇬 Nigeria",
  "🇪🇬 Egito": "🇪🇬 Egypt",
  "🇩🇿 Argélia": "🇩🇿 Algeria",
  "🇹🇳 Tunísia": "🇹🇳 Tunisia",
  "🇬🇭 Gana": "🇬🇭 Ghana",
  "🇨🇮 Costa do Marfim": "🇨🇮 Ivory Coast",
  "🇨🇲 Camarões": "🇨🇲 Cameroon",
  "🇿🇦 África do Sul": "🇿🇦 South Africa",
  "🇲🇱 Mali": "🇲🇱 Mali",
  "🇨🇩 Rep. Dem. Congo": "🇨🇩 DR Congo",
  "🇯🇵 Japão": "🇯🇵 Japan",
  "🇰🇷 Coreia do Sul": "🇰🇷 South Korea",
  "🇮🇷 Irã": "🇮🇷 Iran",
  "🇦🇺 Austrália": "🇦🇺 Australia",
  "🇸🇦 Arábia Saudita": "🇸🇦 Saudi Arabia",
  "🇶🇦 Catar": "🇶🇦 Qatar",
  "🇮🇶 Iraque": "🇮🇶 Iraq",
  "🇦🇪 Emirados Árabes": "🇦🇪 UAE",
  "🇺🇿 Uzbequistão": "🇺🇿 Uzbekistan",
  "🇯🇴 Jordânia": "🇯🇴 Jordan",
  "🇨🇷 Costa Rica": "🇨🇷 Costa Rica",
  "🇵🇦 Panamá": "🇵🇦 Panama",
  "🇯🇲 Jamaica": "🇯🇲 Jamaica",
  "🇭🇳 Honduras": "🇭🇳 Honduras",
  "🇳🇿 Nova Zelândia": "🇳🇿 New Zealand",
};

// ----------------------------------------------------------------------------
// Context
// ----------------------------------------------------------------------------

export type Dict = (typeof dict)["pt"];

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  attr: (key: string, fallback?: string) => string;
  cat: (key: string, fallback?: string) => string;
  catShort: (key: string, fallback?: string) => string;
  pos: (code: string, fallback?: string) => string;
  styleName: (name: string | null | undefined) => string;
  styleDesc: (name: string | null | undefined) => string;
  foot: (value: string | null | undefined) => string;
  nat: (value: string | null | undefined) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "pt" || saved === "en") setLangState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  const t = dict[lang];

  const value: I18nValue = {
    lang,
    setLang,
    t,
    attr: (key, fallback) =>
      lang === "en" ? ATTR_EN[key] ?? fallback ?? key : fallback ?? key,
    cat: (key, fallback) =>
      lang === "en" ? CAT_EN[key] ?? fallback ?? key : fallback ?? key,
    catShort: (key, fallback) =>
      lang === "en" ? CAT_SHORT_EN[key] ?? fallback ?? key : fallback ?? key,
    pos: (code, fallback) =>
      lang === "en" ? POS_EN[code] ?? fallback ?? code : fallback ?? code,
    styleName: (name) =>
      !name ? "" : lang === "en" ? STYLE_EN[name]?.name ?? name : name,
    styleDesc: (name) => {
      if (!name) return "";
      if (lang === "en") return STYLE_EN[name]?.desc ?? "";
      return "";
    },
    foot: (v) => (!v ? "—" : lang === "en" ? FOOT_EN[v] ?? v : v),
    nat: (v) => (!v ? "—" : lang === "en" ? NAT_EN[v] ?? v : v),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
