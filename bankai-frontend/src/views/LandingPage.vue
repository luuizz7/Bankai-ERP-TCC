<template>
    <div class="landing-page">
      <LandingHeader />
      <HeroSection />
  
      <DetailedFeature 
        title="Organização Total com Cadastros Centralizados"
        description="Gerencie clientes, fornecedores, produtos, vendedores e funcionários em um único lugar. Mantenha seus dados sempre atualizados e acessíveis."
        imageSrc="/images/bankai-cadastros.png" 
        :reverseLayout="false" 
      />
       <DetailedFeature 
        title="Controle de Estoque e Suprimentos Eficiente"
        description="Monitore seu estoque em tempo real, crie ordens de compra e registre notas de entrada facilmente. Evite perdas e otimize suas reposições."
        imageSrc="/images/bankai-suprimentos.png" 
        :reverseLayout="true" 
      />
       <DetailedFeature 
        title="Agilidade nas Vendas com PDV e Gestão de Pedidos"
        description="Utilize um Ponto de Venda rápido e intuitivo, crie orçamentos profissionais e acompanhe todo o ciclo dos seus pedidos de venda."
        imageSrc="/images/bankai-vendas.png" 
        :reverseLayout="false" 
      />
       <DetailedFeature 
        title="Visão Completa das Suas Finanças"
        description="Controle o fluxo de caixa, gerencie contas a pagar e a receber, e simplifique a gestão da folha de pagamento. Tenha clareza sobre a saúde financeira do seu negócio."
        imageSrc="/images/bankai-financas.png" 
        :reverseLayout="true" 
      />
      
      <Testimonials /> 
      <FinalCTA /> 
      <LandingFooter />
    </div>
  </template>
  
  <script setup>
  import LandingHeader from '../components/LandingHeader.vue';
  import HeroSection from '../components/HeroSection.vue';
  import DetailedFeature from '../components/DetailedFeature.vue'; 
  import Testimonials from '../components/Testimonials.vue';     
  import FinalCTA from '../components/FinalCTA.vue';           
  import LandingFooter from '../components/LandingFooter.vue';
  </script>
  
  <style scoped>
  .landing-page {
    font-family: sans-serif; 
    color: var(--text-primary); 
    background-color: var(--background-dark); 
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
  }
  </style>