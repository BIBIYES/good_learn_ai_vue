;(function (global) {
  if (!global.Color4Bg) {
    global.Color4Bg = {}
  }

  class Square {
    constructor(options) {
      this.x = options.x || 0
      this.y = options.y || 0
      this.size = options.size || 20
      this.originalSize = this.size
      this.color = options.color || '#ffffff'
      this.speed = options.speed || 1
      this.originalSpeed = this.speed
      this.vx = options.vx || 0
      this.vy = options.vy || 0
      this.angle = options.angle || 0
      this.rotation = options.rotation || 0
      this.rotationSpeed = options.rotationSpeed || 0
      this.opacity = options.opacity || 1
      this.originalOpacity = this.opacity
      this.hover = false
      this.targetSize = this.size
      this.targetOpacity = this.opacity
      this.z = options.z || 0
      this.mouseDistance = 0
      this.mouseInfluence = 0
      this.mouseRepel = options.mouseRepel || false
    }

    update(width, height, mouseX, mouseY) {
      if (mouseX !== null && mouseY !== null) {
        const dx = this.x + this.size / 2 - mouseX
        const dy = this.y + this.size / 2 - mouseY
        this.mouseDistance = Math.sqrt(dx * dx + dy * dy)

        const influenceRadius = 200
        this.mouseInfluence = Math.max(
          0,
          1 - this.mouseDistance / influenceRadius,
        )

        if (this.mouseRepel && this.mouseInfluence > 0) {
          const angle = Math.atan2(dy, dx)
          const force = this.mouseInfluence * 3
          this.vx += Math.cos(angle) * force
          this.vy += Math.sin(angle) * force
        }

        if (this.mouseInfluence > 0.3) {
          this.hover = true
          this.targetSize = this.originalSize * 1.8
          this.targetOpacity = 0.95
        } else {
          this.hover = false
          this.targetSize = this.originalSize
          this.targetOpacity = this.originalOpacity
        }
      }

      this.size += (this.targetSize - this.size) * 0.15
      this.opacity += (this.targetOpacity - this.opacity) * 0.15

      this.x += this.vx
      this.y += this.vy + this.speed

      this.vx *= 0.95
      this.vy *= 0.95

      this.angle += this.rotationSpeed

      if (this.y > height + this.size) {
        this.y = -this.size
        this.x = Math.random() * width
        this.speed = this.originalSpeed
      }

      if (this.x < -this.size) this.x = width + this.size
      if (this.x > width + this.size) this.x = -this.size
    }

    draw(ctx) {
      ctx.save()
      ctx.translate(this.x + this.size / 2, this.y + this.size / 2)
      ctx.rotate(this.angle)
      ctx.globalAlpha = this.opacity

      ctx.fillStyle = this.color

      if (this.hover) {
        ctx.shadowColor = this.color
        ctx.shadowBlur = 20
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }

      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)

      if (this.hover) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size)
      }

      ctx.restore()
    }
  }

  class FloatingSquaresBg {
    constructor(options = {}) {
      this.options = options
      this.dom = options.dom
        ? document.getElementById(options.dom)
        : document.body
      this.colors = options.colors || [
        '#ffffff',
        '#66cc8a',
        '#79be92',
        '#cedbde',
      ]
      this.loop = options.loop !== undefined ? options.loop : true
      this.squares = []
      this.canvas = null
      this.ctx = null
      this.width = 0
      this.height = 0
      this.animationFrame = null
      this.mouseX = null
      this.mouseY = null
      this.mouseActive = false
      this.parallaxFactor = options.parallaxFactor || 0.1
      this.boundHandleMouseMove = this.handleMouseMove.bind(this)
      this.boundHandleTouchMove = this.handleTouchMove.bind(this)

      if (window.getComputedStyle(this.dom).position === 'static') {
        this.dom.style.position = 'relative'
      }

      this.init()
    }

    init() {
      this.canvas = document.createElement('canvas')
      this.canvas.id = 'floatingSquaresCanvas'
      this.canvas.style.position = 'absolute'
      this.canvas.style.top = 0
      this.canvas.style.left = 0
      this.canvas.style.zIndex = 0
      this.dom.appendChild(this.canvas)

      this.ctx = this.canvas.getContext('2d')

      this.resize()

      this.createSquares()

      window.addEventListener('resize', this.resize.bind(this))

      this.bindEvents()

      if (this.loop) {
        this.animate()
      }
    }

    bindEvents() {
      this.unbindEvents()

      document.addEventListener('mousemove', this.boundHandleMouseMove)
      this.canvas.addEventListener('mouseenter', () => {
        this.mouseActive = true
      })
      this.canvas.addEventListener('mouseleave', () => {
        this.mouseActive = false
        this.mouseX = null
        this.mouseY = null
      })

      document.addEventListener('touchmove', this.boundHandleTouchMove, {
        passive: false,
      })
      document.addEventListener('touchstart', this.boundHandleTouchMove, {
        passive: false,
      })
      document.addEventListener('touchend', () => {
        this.mouseActive = false
        this.mouseX = null
        this.mouseY = null
      })
    }

    unbindEvents() {
      document.removeEventListener('mousemove', this.boundHandleMouseMove)
      document.removeEventListener('touchmove', this.boundHandleTouchMove)
      document.removeEventListener('touchstart', this.boundHandleTouchMove)
    }

    handleMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect()
      this.mouseX = e.clientX - rect.left
      this.mouseY = e.clientY - rect.top
      this.mouseActive = true
    }

    handleTouchMove(e) {
      if (e.touches && e.touches.length > 0) {
        e.preventDefault()
        const rect = this.canvas.getBoundingClientRect()
        this.mouseX = e.touches[0].clientX - rect.left
        this.mouseY = e.touches[0].clientY - rect.top
        this.mouseActive = true
      }
    }

    createSquares() {
      this.squares = []

      const squareCount = Math.floor((this.width * this.height) / 6000)

      for (let i = 0; i < squareCount; i++) {
        let size
        const sizeRandom = Math.random()

        if (sizeRandom < 0.7) {
          size = Math.random() * 15 + 5
        } else if (sizeRandom < 0.9) {
          size = Math.random() * 20 + 20
        } else {
          size = Math.random() * 30 + 40
        }

        const z = Math.random()
        const scaledSize = size * (0.5 + z * 0.5)

        const square = new Square({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          size: scaledSize,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          speed: (0.2 + Math.random() * 0.8) * (0.5 + z * 1.5),
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.01,
          opacity: 0.1 + Math.random() * 0.5,
          z: z,
          mouseRepel: Math.random() > 0.3,
        })

        this.squares.push(square)
      }

      this.squares.sort((a, b) => b.z - a.z)
    }

    resize() {
      const rect = this.dom.getBoundingClientRect()
      this.width = rect.width
      this.height = rect.height

      this.canvas.width = this.width
      this.canvas.height = this.height

      if (this.squares.length > 0) {
        this.createSquares()
      }

      this.bindEvents()
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height)

      for (let i = 0; i < this.squares.length; i++) {
        this.squares[i].update(
          this.width,
          this.height,
          this.mouseActive ? this.mouseX : null,
          this.mouseActive ? this.mouseY : null,
        )
        this.squares[i].draw(this.ctx)
      }

      if (this.loop) {
        this.animationFrame = requestAnimationFrame(this.animate.bind(this))
      }
    }

    destroy() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
      }

      this.unbindEvents()

      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas)
      }
    }
  }

  global.Color4Bg.FloatingSquaresBg = FloatingSquaresBg
})(typeof window !== 'undefined' ? window : this)
