const ImageLoader = {
    defaultImages: {
        cardio: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712',
        strength: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50',
        flexibility: 'https://images.unsplash.com/photo-1603988363607-e1e4a66962c6'
    },

    getWorkoutImage(category) {
        const defaultImage = this.defaultImages[category] || this.defaultImages.cardio;
        return `${defaultImage}?auto=format&fit=crop&w=800&q=80`;
    },

    preloadImages() {
        Object.values(this.defaultImages).forEach(src => {
            const img = new Image();
            img.src = `${src}?auto=format&fit=crop&w=800&q=80`;
        });
    }
};

window.ImageLoader = ImageLoader;
