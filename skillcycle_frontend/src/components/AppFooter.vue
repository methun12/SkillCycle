<template>
  <footer class="bg-white border-t border-gray-200 mt-12">
    <div class="container mx-auto px-4 lg:px-6 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">

        <!-- Column 1: Brand and Mission -->
        <div class="col-span-1 md:col-span-1">
          <div class="flex items-center gap-2 mb-3">
            <BookOpenCheck :size="28" class="text-blue-600" />
            <span class="text-xl font-bold text-gray-900">SkillCycle</span>
          </div>
          <p class="text-gray-600 text-sm">
            A platform for students to connect, learn, and grow by exchanging skills and knowledge.
          </p>
        </div>

        <!-- Column 2: Platform Links -->
        <div>
          <h3 class="font-semibold text-gray-800 mb-3">Platform</h3>
          <ul class="space-y-2">
            <li><router-link to="/" class="footer-link">Dashboard</router-link></li>
            <li><router-link to="/matches" class="footer-link">Find Matches</router-link></li>
            <li><router-link to="/deals" class="footer-link">Track Deals</router-link></li>
            <li><router-link to="/profile" class="footer-link">Your Profile</router-link></li>
          </ul>
        </div>

        <!-- Column 3: Resources -->
        <div>
          <h3 class="font-semibold text-gray-800 mb-3">Resources</h3>
          <ul class="space-y-2">
            <li><a href="#" class="footer-link">About Us</a></li>
            <li><a href="#" class="footer-link">How it Works</a></li>
            <li><a href="#" class="footer-link">Help Center</a></li>
            <li><a href="#" class="footer-link">Contact</a></li>
          </ul>
        </div>

        <!-- Column 4: Legal -->
        <div>
          <h3 class="font-semibold text-gray-800 mb-3">Legal</h3>
          <ul class="space-y-2">
            <li><a href="#" class="footer-link">Privacy Policy</a></li>
            <li><a href="#" class="footer-link">Terms of Service</a></li>
          </ul>
        </div>

      </div>

      <!-- Bottom Bar: Copyright and Socials -->
      <div class="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
        <p class="text-sm text-gray-500">
          &copy; {{ currentYear }} SkillCycle. All rights reserved.
        </p>
        <div class="flex space-x-4 mt-4 sm:mt-0">
          <a href="#" class="social-link"><Github :size="20" /></a>
          <a href="#" class="social-link"><Twitter :size="20" /></a>
          <a href="#" class="social-link"><Linkedin :size="20" /></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { BookOpenCheck, Github, Twitter, Linkedin } from 'lucide-vue-next';

// Get the current year for the copyright notice
const currentYear = new Date().getFullYear();
</script>

<style scoped>
/* Custom styles for footer links for a cleaner look */
.footer-link {
  @apply text-sm text-gray-600 hover:text-blue-600 hover:underline transition-colors;
}

/* Custom styles for social media icons */
.social-link {
  @apply text-gray-500 hover:text-blue-600 transition-colors;
}
</style>