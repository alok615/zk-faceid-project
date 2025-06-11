'use client'

import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { ConnectButton } from './ConnectButton'
import { FaceCapture } from './FaceCapture'
import { RiskScoring } from './RiskScoring'
import { Shield, Zap, Eye, Lock, ArrowRight, CheckCircle, Globe, Users, TrendingUp, Star, Award, Sparkles } from 'lucide-react'

const LandingPage = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      
      {/* Floating Elements Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center px-6"
        style={{ opacity }}
      >
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-60"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-60"
            animate={{
              scale: [1.3, 1, 1.3],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
            animate={{
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          {/* Competition Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full px-6 py-3 mb-8 backdrop-blur-sm"
          >
            <Award className="w-5 h-5 text-purple-400" />
            <span className="text-purple-200 font-medium">International Hackathon Entry</span>
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8"
          >
            <motion.h1 
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent leading-tight"
              initial={{ scale: 0.5, rotateX: 30 }}
              animate={{ scale: 1, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Sashakt
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <div className="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent w-24"></div>
              <span className="text-2xl md:text-3xl text-gray-300 font-light">Advanced Identity Verification</span>
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-24"></div>
            </motion.div>

            <motion.p 
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              Revolutionary digital identity platform combining <span className="text-purple-300 font-semibold">facial biometrics</span>, 
              <span className="text-cyan-300 font-semibold"> cryptographic proofs</span>, and 
              <span className="text-pink-300 font-semibold"> AI-powered risk assessment</span>
            </motion.p>

            <motion.p 
              className="text-lg text-gray-400 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              Privacy-first • Instant verification • Military-grade security • Web3 native
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.7 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ConnectButton />
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white font-medium flex items-center gap-3 hover:bg-white/20 transition-all duration-300 group"
            >
              <span>Live Demo</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {[
              { icon: Users, value: "1M+", label: "Verified Users", color: "purple" },
              { icon: Shield, value: "99.9%", label: "Security Rate", color: "cyan" },
              { icon: TrendingUp, value: "0.2s", label: "Avg Response", color: "pink" },
              { icon: Globe, value: "50+", label: "Countries", color: "green" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 2.2 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 5,
                  boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.1)" 
                }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center group cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-12 h-12 mx-auto mb-4 p-3 rounded-xl bg-gradient-to-r ${
                    stat.color === 'purple' ? 'from-purple-500 to-purple-600' :
                    stat.color === 'cyan' ? 'from-cyan-500 to-cyan-600' :
                    stat.color === 'pink' ? 'from-pink-500 to-pink-600' :
                    'from-green-500 to-green-600'
                  }`}
                >
                  <stat.icon className="w-full h-full text-white" />
                </motion.div>
                <div className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          whileHover={{ scale: 1.2 }}
        >
          <div className="w-8 h-12 border-2 border-white/40 rounded-full flex justify-center relative">
            <motion.div
              className="w-2 h-4 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-full mt-2"
              animate={{ opacity: [1, 0.3, 1], y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <p className="text-white/60 text-sm mt-2 text-center">Scroll to explore</p>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Main Application */}
      <ApplicationSection />

      {/* Technology Section */}
      <TechnologySection />

      {/* Footer */}
      <FooterSection />
    </div>
  )
}

const FeaturesSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const features = [
    {
      icon: Eye,
      title: "Biometric Authentication",
      description: "Advanced facial recognition powered by MediaPipe AI for unbreakable identity verification",
      color: "from-purple-500 to-pink-500",
      delay: 0
    },
    {
      icon: Shield,
      title: "Zero-Knowledge Proofs",
      description: "Cryptographic proofs that verify identity without ever revealing personal data",
      color: "from-cyan-500 to-blue-500",
      delay: 0.2
    },
    {
      icon: Zap,
      title: "AI Risk Assessment",
      description: "Real-time financial scoring with machine learning algorithms and risk analysis",
      color: "from-green-500 to-emerald-500",
      delay: 0.4
    },
    {
      icon: Lock,
      title: "Web3 Integration",
      description: "Seamless blockchain connectivity with MetaMask and multi-wallet support",
      color: "from-orange-500 to-red-500",
      delay: 0.6
    }
  ]

  return (
    <section ref={ref} className="py-32 px-6 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full px-6 py-3 mb-8"
          >
            <Star className="w-5 h-5 text-purple-400" />
            <span className="text-purple-200 font-medium">Revolutionary Technology</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Cutting-Edge Features
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Combining the latest breakthroughs in AI, blockchain, and cryptography 
            to create the future of digital identity verification
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateX: 30 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ duration: 0.8, delay: feature.delay }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 10,
                boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.3)" 
              }}
              className="group relative"
            >
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 h-full hover:bg-white/10 transition-all duration-500 relative overflow-hidden">
                {/* Animated background gradient */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  initial={false}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} p-4 mb-6 relative z-10`}
                >
                  <feature.icon className="w-full h-full text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-semibold text-white mb-4 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed relative z-10 group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const ApplicationSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section ref={ref} className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-cyan-900/20"></div>
      
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Experience the Platform
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Try our complete identity verification and risk assessment system in action
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden"
        >
          {/* Animated border gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="relative z-10">
            {/* Face Capture Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-16"
            >
              <FaceCapture />
            </motion.div>

            {/* Risk Assessment Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <RiskScoring />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const TechnologySection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const technologies = [
    { name: "React 18", category: "Frontend" },
    { name: "Next.js 14", category: "Framework" },
    { name: "TypeScript", category: "Language" },
    { name: "Framer Motion", category: "Animation" },
    { name: "Web3Modal", category: "Blockchain" },
    { name: "MediaPipe", category: "AI/ML" },
    { name: "FastAPI", category: "Backend" },
    { name: "Zero-Knowledge", category: "Cryptography" },
    { name: "TailwindCSS", category: "Styling" },
    { name: "Ethereum", category: "Blockchain" },
    { name: "Python", category: "Backend" },
    { name: "Machine Learning", category: "AI/ML" }
  ]

  return (
    <section ref={ref} className="py-32 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Built with Modern Stack
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Leveraging cutting-edge technologies for maximum performance, security, and scalability
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0, rotate: 180 }}
              animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * index, type: "spring" }}
              whileHover={{ 
                scale: 1.1, 
                rotate: 5,
                boxShadow: "0 10px 30px rgba(168, 85, 247, 0.3)" 
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300">
                <span className="text-white font-medium group-hover:text-purple-200 transition-colors">
                  {tech.name}
                </span>
                <div className="text-xs text-gray-400 group-hover:text-gray-300 mt-1">
                  {tech.category}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const FooterSection = () => {
  return (
    <footer className="py-16 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to revolutionize identity verification?
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join the future of secure, privacy-preserving digital identity with Sashakt
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-gray-500 text-sm"
        >
          <p>© 2024 Sashakt. Built for International Hackathon. Privacy-first identity verification.</p>
        </motion.div>
      </div>
    </footer>
  )
}

export default LandingPage
