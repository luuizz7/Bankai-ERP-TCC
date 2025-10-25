<template>
  <div class="landing-page">
    <LandingHeader />
    <HeroSectionBling /> 
    <FeatureHighlightGrid /> 
    
    <DetailedFeature 
      id="cadastros"
      title="Organização Total com Cadastros Centralizados"
      description="Gerencie clientes, fornecedores, produtos, vendedores e funcionários em um único lugar. Mantenha seus dados sempre atualizados e acessíveis para agilizar suas operações."
      icon="fa-solid fa-users-gear" 
      :reverseLayout="false" 
    />
     <DetailedFeature 
      id="suprimentos"
      title="Controle de Estoque e Suprimentos Eficiente"
      description="Monitore seu estoque em tempo real, crie ordens de compra e registre notas de entrada facilmente. Evite perdas, otimize suas reposições e saiba exatamente o que você tem."
      icon="fa-solid fa-boxes-stacked" 
      :reverseLayout="true" 
    />
     <DetailedFeature 
      id="vendas"
      title="Agilidade nas Vendas com PDV e Gestão de Pedidos"
      description="Utilize um Ponto de Venda rápido e intuitivo, perfeito para o dia a dia. Crie orçamentos profissionais e acompanhe todo o ciclo dos seus pedidos de venda, da proposta ao faturamento."
      icon="fa-solid fa-cash-register" 
      :reverseLayout="false" 
    />
     <DetailedFeature 
      id="financas"
      title="Visão Completa das Suas Finanças"
      description="Controle o fluxo de caixa, gerencie contas a pagar e a receber de forma simples e visual. Simplifique a gestão da folha de pagamento e tenha clareza sobre a saúde financeira do seu negócio."
      icon="fa-solid fa-chart-pie" 
      :reverseLayout="true" 
    />
    
    <WhyChooseUs /> 
    <Testimonials id="testimonials" /> 
    <FAQSection id="faq" /> 
    <FinalCTA /> 
    <LandingFooter />
  </div>
</template>

<script setup>
import LandingHeader from '../components/LandingHeader.vue';
import HeroSectionBling from '../components/HeroSectionBling.vue';
import FeatureHighlightGrid from '../components/FeatureHighlightGrid.vue';
import DetailedFeature from '../components/DetailedFeature.vue'; 
import WhyChooseUs from '../components/WhyChooseUs.vue';
import Testimonials from '../components/Testimonials.vue';     
import FAQSection from '../components/FAQSection.vue'; 
import FinalCTA from '../components/FinalCTA.vue';           
import LandingFooter from '../components/LandingFooter.vue';
</script>

<style scoped>
.landing-page{font-family:sans-serif;color:var(--text-primary);background-color:var(--background-dark);display:flex;flex-direction:column;overflow-x:hidden}
</style>