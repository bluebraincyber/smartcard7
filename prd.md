Excelente. A mudança de nome de "EatFood Next" para "SmartCard" é uma decisão estratégica brilhante. Ela remove a limitação do nicho de alimentação e posiciona o produto como uma solução universal para pequenos negócios, ampliando drasticamente o mercado potencial.

A nova versão do PRD reflete essa visão expandida, mantendo o core minimalista e a integração com o WhatsApp que tornam a ideia tão poderosa.

Aqui está a versão atualizada e consolidada do PRD para o **SmartCard**.

-----

# **PRD – SmartCard**

**Versão 2.0 – Estratégia Expandida**
**Data:** 29 de Agosto de 2025

-----

## 1\. Visão Geral

O **SmartCard** é um **cartão de visitas digital e interativo** para pequenos e médios negócios. Ele funciona como um catálogo de produtos ou serviços, simples, rápido e otimizado para dispositivos móveis.

O diferencial é a **integração nativa com o WhatsApp**: o cliente acessa o SmartCard do negócio, escolhe os itens ou serviços de interesse e, com um único clique, envia uma mensagem de pedido ou consulta, já formatada, para o WhatsApp do estabelecimento.

**Decisão fundamental:**
Cada negócio terá seu próprio subdomínio exclusivo e fácil de compartilhar, fortalecendo sua marca.

```
barbearia.smartcard.app
doceria.smartcard.app
clinica.smartcard.app
```

Este modelo de subdomínio é a base da identidade e simplicidade do produto.

-----

## 2\. Problema

  * **Presença Digital Fragmentada:** Pequenos negócios dependem de PDFs, fotos de cardápios ou posts de Instagram que ficam desatualizados e são difíceis de navegar.
  * **Fricção no Atendimento:** O WhatsApp é o principal canal de vendas, mas o processo é desorganizado. Pedidos e consultas chegam incompletos ("quanto custa o serviço x?"), exigindo várias interações para obter informações básicas.
  * **Altos Custos e Complexidade:** Plataformas de marketplace e sistemas de e-commerce tradicionais são caros, complexos de configurar e afastam o negócio do contato direto com seu cliente.

-----

## 3\. Solução

  * **Um "SmartCard" único:** Um link (`negocio.smartcard.app`) que centraliza o catálogo de produtos/serviços de forma elegante e sempre atualizada.
  * **Jornada sem atritos:** O cliente navega, escolhe e clica para enviar uma mensagem completa e organizada diretamente no WhatsApp.
  * **Controle para o Lojista:** O negócio mantém o relacionamento direto com o cliente no WhatsApp, sem intermediários.
  * **Autonomia e Simplicidade:** Uma plataforma de gerenciamento (`dashboard.smartcard.app`) onde o próprio dono do negócio pode configurar tudo em minutos, sem precisar de ajuda técnica.

-----

## 4\. Público-Alvo

A plataforma é agnóstica, mas o foco de lançamento será em nichos com alta transação via WhatsApp.

  * **Público Primário (Foco do MVP):**

      * **Alimentação:** Restaurantes, lanchonetes, pizzarias, hamburguerias, docerias, açaís.
      * **Serviços Locais:** Salões de beleza, barbearias, estúdios de tatuagem, clínicas de estética, pet shops.

  * **Público Secundário (Expansão):**

      * Profissionais autônomos, consultórios, pequenos varejistas.

-----

## 5\. Escopo

### In (MVP)

  * Subdomínios automáticos e gratuitos (`negocio.smartcard.app`).
  * Catálogo digital com categorias e itens (produtos ou serviços).
  * Botão de ação para iniciar conversa no WhatsApp com mensagem pré-formatada.
  * Opção de capturar informações adicionais (ex: endereço para delivery, dados para agendamento).
  * Painel administrativo para o lojista gerenciar o catálogo e as configurações.
  * Controle de disponibilidade de itens ("Indisponível hoje" / "Indisponível permanentemente").
  * Analytics essenciais: visualizações do SmartCard, cliques no botão do WhatsApp, itens mais selecionados.
  * Onboarding com **templates de catálogo iniciais** por segmento (ex: "Barbearia", "Doceria").
  * Privacidade de dados conforme a LGPD.

### Out (MVP e Futuro)

  * **Domínios próprios:** O modelo é exclusivamente via subdomínio `smartcard.app`. Isso nunca mudará.
  * Pagamentos online.
  * Integrações com sistemas de gestão (ERP/CRM).
  * Logística integrada.

-----

## 6\. Experiência do Usuário

### Cliente Final

1.  Acessa `nomedonegocio.smartcard.app` via link ou QR Code.
2.  Navega pelo catálogo de produtos ou serviços.
3.  Adiciona itens ao "pedido" ou "cesta de interesse".
4.  Clica em **“Enviar via WhatsApp”**.
5.  (Opcional) Preenche um campo extra, como endereço.
6.  O app do WhatsApp abre com uma mensagem pronta para ser enviada.

**Mensagem gerada (exemplo Barbearia):**

```
Olá! Gostaria de um orçamento/agendamento:
- Corte Masculino (1)
- Barba Modelada (1)
---
Enviado via SmartCard
```

### Dono do Negócio (Lojista)

1.  Acessa `dashboard.smartcard.app`.
2.  Cria sua conta com e-mail e senha.
3.  No onboarding, escolhe o nome do seu subdomínio (`meunegocio`) e um template inicial.
4.  Edita o template com seus produtos/serviços, preços e fotos.
5.  Publica e começa a compartilhar seu link do SmartCard.

-----

## 7\. Arquitetura Técnica

  * **Frontend:** Next.js (App Router), SSR/ISR para o catálogo público, Tailwind CSS.
  * **Backend/API:** Next.js API Routes ou um serviço Node.js separado.
  * **Banco de Dados:** PostgreSQL com arquitetura multi-tenant (schema por tenant).
  * **Autenticação:** NextAuth.js (ou similar).
  * **Armazenamento de Mídia:** Um serviço como Cloudinary ou AWS S3.
  * **Infraestrutura:** Vercel para o frontend/SSR, e Railway ou Supabase para o banco de dados.
  * **Domínios:** DNS configurado com um registro Wildcard (`*.smartcard.app`) para provisionamento automático.

-----

## 8\. Painel Administrativo

  * **Dashboard:** Visão geral com métricas chave (visitas, cliques, itens populares).
  * **Gestão do Catálogo:** Interface visual para criar, editar, ordenar e excluir categorias e itens.
  * **Configurações:** Alterar logo, nome do negócio, número de WhatsApp, e ativar/desativar campos extras (como o de endereço).
  * **Disponibilidade:** Botões de acesso rápido para marcar itens como indisponíveis.

-----

## 9\. Métricas de Sucesso (KPIs)

  * **Taxa de Ativação:** % de novos cadastros que publicam seu primeiro SmartCard em até 24h.
  * **CTR-WhatsApp:** % de visitantes do SmartCard que clicam no botão para enviar a mensagem.
  * **Lojas Ativas Semanais:** Negócios cujo SmartCard recebeu pelo menos um clique de envio na semana.
  * **Análise de Abandono:** Itens que são frequentemente adicionados à cesta, mas removidos antes do envio.

-----

## 10\. Roadmap

### MVP (V1.0)

  * Tudo listado na seção "In (MVP)". O foco é lançar a ferramenta principal de forma robusta e funcional.

### V1.1 (Pós-lançamento)

  * **Melhorias de UX:** Ordenação de itens com arrastar e soltar no painel.
  * **Recursos de Marketing:** Geração de QR Code customizável direto do painel. Opção de "Item em Destaque".
  * **Compactação de Mensagem:** Lógica para encurtar mensagens muito longas para o link do WhatsApp.

### V1.2 (Evolução)

  * **Agendamento Simplificado:** Para negócios de serviço, adicionar um botão de "Sugerir Horário" que anexa uma data/hora à mensagem do WhatsApp.
  * **Múltiplos Templates:** Permitir que o negócio crie diferentes SmartCards (ex: um para serviços, outro para produtos).
  * **Relatórios Avançados:** Análise de horários de pico de cliques e tendências de popularidade de itens.

-----

## 11\. Privacidade e LGPD

  * A coleta de dados pessoais (como endereço) é opcional, configurada pelo dono do negócio, e tem o único propósito de facilitar a comunicação via WhatsApp.
  * A plataforma opera com o princípio de armazenamento mínimo de dados.
  * A política de privacidade será clara e acessível para todos os usuários.

-----

## 12\. Riscos e Mitigações

  * **Dependência do WhatsApp:** O core do produto depende da API `wa.me`. **Mitigação:** Manter um botão fallback de "Copiar Pedido" para a área de transferência do usuário.
  * **Adoção:** O desafio de educar o mercado sobre a nova ferramenta. **Mitigação:** Foco total na simplicidade do onboarding (com templates) e na comunicação clara dos benefícios (organização e profissionalismo).
  * **Performance:** A velocidade de carregamento do SmartCard é crucial. **Mitigação:** Usar uma arquitetura de alta performance (Next.js com ISR/SSR) e otimização agressiva de imagens.

-----

## 13\. Conclusão

O **SmartCard** é a evolução do cartão de visitas. É uma ferramenta minimalista e de alto impacto, projetada para a realidade do pequeno negócio brasileiro. Ao focar na simplicidade e na integração com a ferramenta que todos já usam — o WhatsApp — ele remove barreiras e entrega valor imediato. O MVP é enxuto, mas resolve um problema real, com um caminho claro para evoluções que agregarão ainda mais valor ao longo do tempo.