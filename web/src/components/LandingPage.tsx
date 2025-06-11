'use client'

import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { ConnectButton } from './ConnectButton'
import { FaceCapture } from './FaceCapture'
import { RiskScoring } from './RiskScoring'
import FinancialFlow from './FinancialFlow'
import { Shield, Zap, Eye, Lock, ArrowRight, CheckCircle, Globe, Users, TrendingUp, Star, Award, Sparkles, CreditCard, Building, FileText, BarChart3, ChevronRight, PlayCircle, Target, Layers, Briefcase, Cpu, Database, Fingerprint, Wallet, DollarSign, PieChart, Activity, Smartphone, Camera, Scan } from 'lucide-react'

const LandingPage = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Enhanced state management
  const [activeSection, setActiveSection] = useState<'hero' | 'identity' | 'financial'>('hero')
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)

  // Scroll detection for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address)
  }

  // Floating animation component
  const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
    <motion.div
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 1, -1, 0]
      }}
      transition={{ 
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden relative">
      
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-500/30 via-red-500/20 to-pink-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-blue-500/30 via-purple-500/20 to-cyan-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/20 to-teal-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-400 rounded-full"
            animate={{
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Enhanced Navigation */}
      <motion.nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-black/80 backdrop-blur-xl border-b border-orange-500/20 shadow-lg shadow-orange-500/10' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="relative">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Shield className="w-6 h-6 text-white" />
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <motion.div 
                  className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ["0%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  Sashakt
                </motion.div>
                <div className="text-xs text-gray-400 font-medium">Digital Identity Pro</div>
              </div>
            </motion.div>
            
            {/* Enhanced Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { id: 'hero', label: 'Home', icon: Target },
                { id: 'identity', label: 'Identity', icon: Fingerprint },
                { id: 'financial', label: 'Financial', icon: DollarSign }
              ].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/30'
                      : 'text-gray-300 hover:text-orange-300 hover:bg-orange-500/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Enhanced Connect Button */}
            <div className="flex items-center space-x-4">
              {walletAddress && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl px-3 py-2"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </motion.div>
              )}
              <ConnectButton onConnect={handleWalletConnect} />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - Enhanced */}
      {activeSection === 'hero' && (
        <motion.section 
          className="relative min-h-screen flex items-center justify-center px-6 pt-20"
          style={{ opacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            {/* Enhanced Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border border-orange-500/30 rounded-full px-8 py-4 mb-8 backdrop-blur-sm shadow-lg shadow-orange-500/20"
            >
              <FloatingElement>
                <Award className="w-6 h-6 text-orange-400" />
              </FloatingElement>
              <span className="text-orange-200 font-semibold text-lg">Day 4: Complete Identity & Financial Platform</span>
              <FloatingElement delay={0.5}>
                <Sparkles className="w-6 h-6 text-pink-400" />
              </FloatingElement>
            </motion.div>

            {/* Enhanced Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="mb-12"
            >
              <motion.h1 
                className="text-8xl md:text-9xl lg:text-[14rem] font-black mb-8 leading-none"
                initial={{ scale: 0.8, rotateX: 20 }}
                animate={{ scale: 1, rotateX: 0 }}
                transition={{ duration: 1.2, delay: 0.6 }}
              >
                <motion.span
                  className="bg-gradient-to-r from-orange-400 via-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ["0%", "100%", "0%"],
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  style={{ backgroundSize: "300%" }}
                >
                  Sashakt
                </motion.span>
              </motion.h1>
              
              {/* Enhanced Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex items-center justify-center gap-6 mb-8"
              >
                <motion.div 
                  className="h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent w-32"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 1.2 }}
                />
                <span className="text-3xl md:text-5xl text-white font-light tracking-wide">
                  Professional Identity Platform
                </span>
                <motion.div 
                  className="h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent w-32"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 1.2 }}
                />
              </motion.div>

              {/* Enhanced Description */}
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 max-w-6xl mx-auto mb-8 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                Enterprise-grade digital identity verification combining{' '}
                <motion.span 
                  className="text-orange-400 font-semibold"
                  whileHover={{ scale: 1.05, color: "#fb923c" }}
                >
                  biometric authentication
                </motion.span>
                ,{' '}
                <motion.span 
                  className="text-red-400 font-semibold"
                  whileHover={{ scale: 1.05, color: "#f87171" }}
                >
                  zero-knowledge proofs
                </motion.span>
                , and{' '}
                <motion.span 
                  className="text-pink-400 font-semibold"
                  whileHover={{ scale: 1.05, color: "#f472b6" }}
                >
                  AI-powered financial assessment
                </motion.span>
              </motion.p>

              {/* Enhanced Feature Pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.6 }}
                className="flex flex-wrap justify-center gap-4 mb-16"
              >
                {[
                  { text: "Bank-grade security", icon: Shield, color: "from-green-500 to-emerald-500" },
                  { text: "Instant verification", icon: Zap, color: "from-yellow-500 to-orange-500" },
                  { text: "Complete privacy", icon: Lock, color: "from-purple-500 to-pink-500" },
                  { text: "Web3 integration", icon: Cpu, color: "from-blue-500 to-cyan-500" }
                ].map((pill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`flex items-center space-x-2 bg-gradient-to-r ${pill.color}/20 border border-current/30 rounded-full px-6 py-3 backdrop-blur-sm`}
                  >
                    <pill.icon className="w-5 h-5" />
                    <span className="text-white font-medium">{pill.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Enhanced CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.9 }}
              className="flex flex-col lg:flex-row gap-8 justify-center items-center mb-20"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.6)",
                  y: -5
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection('identity')}
                className="group relative px-12 py-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-2xl overflow-hidden shadow-lg shadow-orange-500/30 transition-all duration-300"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
                <div className="relative flex items-center gap-4">
                  <Shield className="w-6 h-6" />
                  <span>Identity Verification</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.4)",
                  y: -5
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection('financial')}
                className="group relative px-12 py-6 bg-black/50 border-2 border-orange-500 text-orange-400 font-bold text-lg rounded-2xl backdrop-blur-sm hover:bg-orange-500/10 transition-all duration-300 shadow-lg shadow-orange-500/20"
              >
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-6 h-6" />
                  <span>Financial Assessment</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.div>
                </div>
              </motion.button>
            </motion.div>

            {/* Enhanced Stats with Animations */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto"
            >
              {[
                { icon: Users, value: "1M+", label: "Verified Users", gradient: "from-orange-400 to-red-500", delay: 0 },
                { icon: Shield, value: "99.9%", label: "Security Rate", gradient: "from-red-500 to-pink-500", delay: 0.1 },
                { icon: Zap, value: "<2s", label: "Verification Time", gradient: "from-pink-500 to-purple-500", delay: 0.2 },
                { icon: Globe, value: "50+", label: "Countries", gradient: "from-purple-500 to-blue-500", delay: 0.3 }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 2.4 + stat.delay }}
                  whileHover={{ 
                    scale: 1.1,
                    y: -10,
                    boxShadow: "0 20px 40px rgba(251, 146, 60, 0.3)"
                  }}
                  className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 hover:border-orange-500/50 rounded-3xl p-8 text-center transition-all duration-500 overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    initial={false}
                  />
                  
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`relative w-16 h-16 mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-lg`}
                  >
                    <stat.icon className="w-full h-full text-white" />
                  </motion.div>
                  
                  <motion.div 
                    className="text-4xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors relative"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2.6 + stat.delay, type: "spring" }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-gray-400 group-hover:text-gray-300 transition-colors relative">
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
            <div className="relative">
              <div className="w-8 h-12 border-2 border-orange-500/60 rounded-full flex justify-center relative backdrop-blur-sm">
                <motion.div
                  className="w-2 h-4 bg-gradient-to-b from-orange-400 to-red-500 rounded-full mt-2"
                  animate={{ 
                    opacity: [1, 0.3, 1], 
                    y: [0, 8, 0],
                    scale: [1, 0.8, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <motion.div
                className="absolute -inset-2 border border-orange-500/30 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <p className="text-orange-400/80 text-sm mt-3 text-center font-medium">Explore features</p>
          </motion.div>
        </motion.section>
      )}

      {/* Identity Verification Section - Enhanced */}
      {activeSection === 'identity' && (
        <motion.section
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen pt-24 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <motion.button
                onClick={() => setActiveSection('hero')}
                className="inline-flex items-center gap-3 text-orange-400 hover:text-orange-300 mb-8 transition-colors bg-orange-500/10 border border-orange-500/30 rounded-xl px-6 py-3 backdrop-blur-sm"
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span className="font-medium">Back to Home</span>
              </motion.button>
              
              <motion.h2 
                className="text-6xl md:text-7xl font-bold text-white mb-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Identity Verification
                </span>
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-400 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Advanced biometric authentication with zero-knowledge proofs for maximum privacy
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="bg-gradient-to-br from-gray-900/40 via-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-red-500/5 rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="bg-black/30 rounded-2xl p-6 border border-gray-700"
                  >
                    <FaceCapture />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    className="bg-black/30 rounded-2xl p-6 border border-gray-700"
                  >
                    <RiskScoring />
                  </motion.div>
                </div>

                {/* Enhanced Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: Eye,
                      title: "Biometric Authentication",
                      description: "Advanced facial recognition with liveness detection",
                      gradient: "from-orange-500 to-red-500"
                    },
                    {
                      icon: Shield,
                      title: "Zero-Knowledge Proofs",
                      description: "Cryptographic verification without data exposure",
                      gradient: "from-red-500 to-pink-500"
                    },
                    {
                      icon: Lock,
                      title: "Privacy-First",
                      description: "Your data never leaves your device",
                      gradient: "from-pink-500 to-purple-500"
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-orange-500/50 rounded-2xl p-6 transition-all duration-300 group"
                    >
                      <motion.div 
                        className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <feature.icon className="w-full h-full text-white" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Financial Assessment Section - Enhanced */}
      {activeSection === 'financial' && (
        <motion.section
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen pt-24 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <motion.button
                onClick={() => setActiveSection('hero')}
                className="inline-flex items-center gap-3 text-orange-400 hover:text-orange-300 mb-8 transition-colors bg-orange-500/10 border border-orange-500/30 rounded-xl px-6 py-3 backdrop-blur-sm"
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span className="font-medium">Back to Home</span>
              </motion.button>
              
              <motion.h2 
                className="text-6xl md:text-7xl font-bold text-white mb-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Financial Assessment
                </span>
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-400 max-w-3xl mx-auto mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Comprehensive financial verification through Account Aggregator and DigiLocker integration
              </motion.p>

              {/* Enhanced Day 4 Features Showcase */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {[
                  {
                    icon: Building,
                    title: "Account Aggregator",
                    description: "Secure bank data access with user consent",
                    gradient: "from-green-500 to-emerald-500"
                  },
                  {
                    icon: FileText,
                    title: "DigiLocker Integration",
                    description: "Digital document verification system",
                    gradient: "from-blue-500 to-cyan-500"
                  },
                  {
                    icon: BarChart3,
                    title: "AI Risk Scoring",
                    description: "Advanced financial risk assessment engine",
                    gradient: "from-purple-500 to-pink-500"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700 hover:border-green-500/50 rounded-2xl p-6 transition-all duration-300 group backdrop-blur-sm"
                  >
                    <motion.div 
                      className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl p-4 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-full h-full text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Enhanced Financial Flow Component */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="bg-gradient-to-br from-gray-900/40 via-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700 rounded-3xl overflow-hidden relative shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5"></div>
              
              <div className="relative z-10">
                <FinancialFlow 
                  walletAddress={walletAddress}
                  userProfile={userProfile}
                  onFlowComplete={(data) => {
                    console.log('Financial assessment complete:', data)
                    setUserProfile(data)
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Enhanced Features Overview - Only show on hero */}
      {activeSection === 'hero' && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-32 px-6 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent"></div>
          
          <div className="max-w-7xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-full px-8 py-4 mb-8 backdrop-blur-sm">
                <Star className="w-6 h-6 text-orange-400" />
                <span className="text-orange-200 font-semibold text-lg">Enterprise-Grade Technology</span>
              </div>
              
              <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Professional Features
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Complete digital identity and financial verification platform built for enterprise security
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Eye,
                  title: "Biometric Auth",
                  description: "Advanced facial recognition with liveness detection",
                  gradient: "from-orange-400 to-red-500"
                },
                {
                  icon: Shield,
                  title: "ZK Proofs",
                  description: "Zero-knowledge cryptographic verification",
                  gradient: "from-red-500 to-pink-500"
                },
                {
                  icon: Building,
                  title: "Account Aggregator",
                  description: "Secure financial data integration",
                  gradient: "from-green-500 to-emerald-500"
                },
                {
                  icon: BarChart3,
                  title: "Risk Assessment",
                  description: "AI-powered financial risk scoring",
                  gradient: "from-blue-500 to-purple-500"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateX: 30 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: 5,
                    y: -10,
                    boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.4)" 
                  }}
                  className="group relative"
                >
                  <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-orange-500/50 rounded-3xl p-8 h-full transition-all duration-500 relative overflow-hidden">
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${feature.gradient}/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      initial={false}
                    />
                    
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} p-4 mb-6 relative z-10 shadow-lg`}
                    >
                      <feature.icon className="w-full h-full text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-semibold text-white mb-4 relative z-10 group-hover:text-orange-400 transition-colors">
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
        </motion.section>
      )}

      {/* Enhanced Technology Stack */}
      {activeSection === 'hero' && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-32 px-6"
        >
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Built with Modern Stack
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Enterprise-grade technologies for maximum performance, security, and scalability
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-4"
            >
              {[
                { name: "React 18", category: "Frontend", color: "from-blue-500 to-cyan-500" },
                { name: "Next.js 14", category: "Framework", color: "from-gray-600 to-gray-800" },
                { name: "TypeScript", category: "Language", color: "from-blue-600 to-blue-800" },
                { name: "Framer Motion", category: "Animation", color: "from-purple-500 to-pink-500" },
                { name: "Web3Modal", category: "Blockchain", color: "from-orange-500 to-red-500" },
                { name: "MediaPipe", category: "AI/ML", color: "from-green-500 to-emerald-500" },
                { name: "FastAPI", category: "Backend", color: "from-teal-500 to-cyan-500" },
                { name: "Account Aggregator", category: "FinTech", color: "from-yellow-500 to-orange-500" },
                { name: "DigiLocker", category: "Gov-Tech", color: "from-indigo-500 to-purple-500" },
                { name: "Zero-Knowledge", category: "Cryptography", color: "from-red-500 to-pink-500" },
                { name: "TailwindCSS", category: "Styling", color: "from-cyan-500 to-blue-500" },
                { name: "Python", category: "Backend", color: "from-yellow-600 to-blue-600" }
              ].map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0, rotate: 180 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index, type: "spring" }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                    y: -5,
                    boxShadow: "0 10px 30px rgba(251, 146, 60, 0.4)" 
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative"
                >
                  <div className={`px-6 py-4 bg-gradient-to-r ${tech.color}/20 border border-current/30 rounded-full backdrop-blur-sm hover:border-current/50 transition-all duration-300`}>
                    <span className="text-white font-medium group-hover:text-current transition-colors">
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
        </motion.section>
      )}

      {/* Enhanced Footer */}
      <footer className="py-16 px-6 border-t border-gray-800/50 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h3 className="text-4xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Ready for the Future of Identity?
              </span>
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience the next generation of secure, privacy-preserving digital identity verification
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-gray-500 text-sm"
          >
            <p>© 2024 Sashakt. Professional Digital Identity Platform. Enterprise Security & Privacy.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
