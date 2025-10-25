<template>
  <section id="testimonials" class="testimonials-section">
    <div class="container">
      <h2>O Que Dizem Nossos Clientes</h2>
      
      <div class="carousel-outer-container">
        <button 
          @click="manualPrev" 
          class="carousel-arrow arrow-left" 
          :disabled="isTransitioning || (!loop && activeIndex === 0)"
          aria-label="Depoimento Anterior"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-left" />
        </button>

        <div class="carousel-container" ref="carouselContainerRef" @mouseenter="pauseAutoplay" @mouseleave="resumeAutoplay">
          <div class="testimonials-wrapper" :style="wrapperStyle">
            <blockquote 
              v-for="(testimonial, index) in clonedTail" 
              :key="'clone-tail-' + index"
              class="testimonial-item is-clone"
              aria-hidden="true" 
            >
              <p>{{ testimonial.quote }}</p>
              <footer> <cite>{{ testimonial.name }}</cite> <span>{{ testimonial.company }}</span> </footer>
            </blockquote>

            <blockquote 
              v-for="(testimonial, index) in testimonials" 
              :key="index"
              class="testimonial-item"
              :class="{ 
                'is-active': index === activeIndex
              }" 
              :ref="el => setItemRef(el, index)"
            >
              <p>{{ testimonial.quote }}</p>
              <footer>
                <cite>{{ testimonial.name }}</cite>
                <span>{{ testimonial.company }}</span>
              </footer>
            </blockquote>

             <blockquote 
              v-for="(testimonial, index) in clonedHead" 
              :key="'clone-head-' + index"
              class="testimonial-item is-clone"
              aria-hidden="true" 
            >
              <p>{{ testimonial.quote }}</p>
              <footer> <cite>{{ testimonial.name }}</cite> <span>{{ testimonial.company }}</span> </footer>
            </blockquote>
          </div>
        </div>

         <button 
          @click="manualNext" 
          class="carousel-arrow arrow-right" 
          aria-label="Próximo Depoimento"
           :disabled="isTransitioning || (!loop && activeIndex === testimonials.length - 1)"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-right" />
        </button>
      </div>
       
       <div class="carousel-dots">
         <button 
            v-for="(_, index) in testimonials" 
            :key="index"
            :class="{ active: index === activeIndex }"
            @click="goTo(index)"
            :aria-label="`Ir para depoimento ${index + 1}`"
         ></button>
       </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeUpdate, nextTick } from 'vue';

// --- Configurações ---
const loop = true; 
const autoplay = true;
const autoplayDelay = 7000; 
const transitionDuration = 500; // ms 
const clonesCount = loop ? 1 : 0; 
// --------------------

const testimonials = ref([
  { quote: "O BankaiERP transformou a gestão da nossa empresa...", name: "Ana Silva", company: "Gerente, Loja Brilho e Cor" },
  { quote: "Finalmente um ERP que entende as necessidades do pequeno negócio...", name: "Carlos Santos", company: "Proprietário, Mercearia Sabor da Terra" },
  { quote: "O controle de estoque ficou muito mais fácil...", name: "Mariana Costa", company: "Supervisora, Ateliê Criativo" },
  { quote: "O suporte é rápido e eficiente...", name: "João Oliveira", company: "Diretor, Oficina Mecânica Veloz" },
]);

const totalSlides = computed(() => testimonials.value.length);
const activeIndex = ref(0); 
const currentIndex = ref(clonesCount); 
const itemRefs = ref([]); 
const carouselContainerRef = ref(null);
let autoplayInterval = null;
const isTransitioning = ref(false); 
const itemWidthWithGap = ref(0); 
let transitionEndTimeout = null; 

const clonedHead = computed(() => loop ? testimonials.value.slice(0, clonesCount) : []);
const clonedTail = computed(() => loop ? testimonials.value.slice(-clonesCount) : []);

const setItemRef = (el, index) => { if (el) { itemRefs.value[index] = el; } };
onBeforeUpdate(() => { itemRefs.value = []; });

const calculateItemWidth = () => {
   nextTick(() => { 
      if (itemRefs.value.length > 0 && itemRefs.value[0]) {
         const firstItem = itemRefs.value[0];
         const itemStyle = window.getComputedStyle(firstItem);
         const width = firstItem.offsetWidth;
         const margin = parseFloat(itemStyle.marginLeft) + parseFloat(itemStyle.marginRight);
         itemWidthWithGap.value = width + margin;
         
         const initialRealIndex = activeIndex.value + clonesCount;
          if (currentIndex.value !== initialRealIndex) { 
              currentIndex.value = initialRealIndex; 
              isTransitioning.value = false; 
          }
      }
   });
};

const wrapperStyle = computed(() => {
  let offset = 0;
  if (carouselContainerRef.value && itemWidthWithGap.value > 0) {
     const baseOffset = -currentIndex.value * itemWidthWithGap.value;
     const centeringAdjustment = (carouselContainerRef.value.offsetWidth / 2) - (itemWidthWithGap.value / 2);
     offset = baseOffset + centeringAdjustment;
  }
  return {
    transform: `translateX(${offset}px)`,
    transition: isTransitioning.value ? `transform ${transitionDuration / 1000}s ease-in-out` : 'none'
  };
});

const moveTo = (targetLogicalIndex) => {
    if (isTransitioning.value && loop) return; 

    if (transitionEndTimeout) clearTimeout(transitionEndTimeout);

    isTransitioning.value = true; 

    let targetRealIndex = targetLogicalIndex + clonesCount;

    if (loop) {
       activeIndex.value = (targetLogicalIndex + totalSlides.value) % totalSlides.value;
    } else {
       activeIndex.value = Math.max(0, Math.min(targetLogicalIndex, totalSlides.value - 1));
       targetRealIndex = activeIndex.value; 
    }
    
    currentIndex.value = targetRealIndex;

    if (loop) {
        transitionEndTimeout = setTimeout(() => {
            let needsJump = false;
            if (currentIndex.value < clonesCount) {
                currentIndex.value = totalSlides.value + clonesCount -1; 
                needsJump = true;
            } else if (currentIndex.value >= totalSlides.value + clonesCount) {
                 currentIndex.value = clonesCount; 
                 needsJump = true;
            }

            if (needsJump) {
                isTransitioning.value = false; 
                nextTick(() => { 
                    // No JS puro, não precisa reativar aqui, o computed fará isso
                    // isTransitioning.value = true; // Não reativar aqui diretamente
                });
            }
             // Importante: Resetar a flag *depois* do possível salto SEM transição
             // Usamos outro timeout curto ou nextTick para garantir que o DOM atualizou sem transição
             nextTick(() => {
                 isTransitioning.value = false; // Permite o próximo movimento
             });
           
        }, transitionDuration); 
    } else {
         transitionEndTimeout = setTimeout(() => {
            isTransitioning.value = false;
        }, transitionDuration);
    }

    if (autoplay) resetAutoplay(); 
};


const goTo = (logicalIndex) => { moveTo(logicalIndex); };
const manualNext = () => { moveTo(activeIndex.value + 1); }; 
const manualPrev = () => { moveTo(activeIndex.value - 1); }; 

const startAutoplay = () => {
  if (!autoplay || autoplayInterval || totalSlides.value <= 1) return; 
  autoplayInterval = setInterval(() => {
    moveTo(activeIndex.value + 1); 
  }, autoplayDelay);
};
const stopAutoplay = () => { clearInterval(autoplayInterval); autoplayInterval = null; };
const resetAutoplay = () => { if(autoplay) { stopAutoplay(); startAutoplay();} };

const pauseAutoplay = () => { if (autoplay) stopAutoplay(); };
const resumeAutoplay = () => { if (autoplay) startAutoplay(); };

onMounted(() => { 
    calculateItemWidth(); 
    startAutoplay(); 
    window.addEventListener('resize', calculateItemWidth); 
});

onUnmounted(() => { 
    stopAutoplay(); 
    if (transitionEndTimeout) clearTimeout(transitionEndTimeout); 
    window.removeEventListener('resize', calculateItemWidth);
});

</script>

<style scoped>
.testimonials-section {
  padding: 5rem 0;
  background-color: var(--background-dark);
  overflow: hidden; 
}
.container {
  max-width: 100%; 
  margin: 0 auto;
  padding: 0; 
  text-align: center;
}
h2 {
  font-size: 2.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 3rem; 
}

.carousel-outer-container {
  position: relative;
  width: 90%; 
  max-width: 1200px; 
  margin: 0 auto; 
}

.carousel-container {
  width: 100%;
  overflow: hidden; 
}

.testimonials-wrapper {
  display: flex; 
  align-items: center; 
  width: max-content; 
  /* transition é controlada via :style */
}

.testimonial-item {
  background-color: var(--background-light);
  padding: 2.5rem 2rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  text-align: left;
  flex-shrink: 0; 
  width: clamp(280px, 30vw, 350px); 
  margin: 0 1rem; 
  
  transform: scale(0.9); 
  opacity: 0.7;
  transition: transform 0.6s ease, opacity 0.6s ease, border-color 0.4s ease;
  box-sizing: border-box; 
}

.testimonial-item.is-active { 
  transform: scale(1);
  opacity: 1;
  border-color: var(--accent-color); 
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}

.testimonial-item p {
  font-style: italic; color: var(--text-primary); line-height: 1.7; margin-bottom: 1.5rem; border-left: 4px solid var(--accent-color); padding-left: 1.5rem; font-size: 1rem; min-height: 100px; 
}
.testimonial-item footer { margin-top: 1rem; padding-left: 1.9rem; }
.testimonial-item cite { display: block; font-weight: 600; color: var(--text-primary); font-style: normal; }
.testimonial-item span { font-size: .9rem; color: var(--text-secondary); }

.carousel-arrow {
  background: rgba(var(--background-light-rgb, 44, 44, 44), 0.5); 
  border: none; 
  color: var(--text-primary); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: background-color 0.2s ease, opacity 0.2s ease; flex-shrink: 0; position: absolute; top: 50%; transform: translateY(-50%); 
}
.carousel-arrow:hover:not(:disabled) { background-color: var(--background-light); }
.carousel-arrow:disabled { opacity: 0.3; cursor: not-allowed; pointer-events: none; }

.arrow-left { left: 0px; } 
.arrow-right { right: 0px; } 

@media (max-width: 768px) {
  .carousel-outer-container { width: 100%; } 
  .arrow-left { left: 5px; } 
  .arrow-right { right: 5px; } 
  .testimonial-item { width: 70vw; margin: 0 0.5rem;} 
}

.carousel-dots {
  display: flex; justify-content: center; gap: 0.7rem; margin-top: 2rem; 
}
.carousel-dots button {
  width: 10px; height: 10px; border-radius: 50%; background-color: var(--border-color); border: none; padding: 0; cursor: pointer; transition: background-color 0.2s ease, transform 0.2s ease;
}
.carousel-dots button.active {
  background-color: var(--accent-color); transform: scale(1.2); 
}
</style>