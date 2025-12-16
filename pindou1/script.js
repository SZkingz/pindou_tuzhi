// Global variables
let originalImage = null;
let canvasWidth = 0;
let canvasHeight = 0;
let pixelData = []; // Store pixel block color data
let colorStats = {}; // Store color statistics
let colorCategories = []; // Color categories, format: [{id: "categoryID", name: "categoryName", colors: [{name: "colorName", color: "#hex"}]}]
let currentCategoryId = null; // Currently used color category ID
let zoomLevel = 1.0; // Drawing zoom level

// Guide line settings
let showGridLines = false; // Whether to show guide lines
let gridSize = {width: 5, height: 5}; // Guide line grid size (number of blocks)
let gridStartPos = 'top-left'; // Guide line start position
let gridColor = '#ff0000'; // Guide line color, default red
let gridThickness = 2; // Guide line thickness

// DOM elements - initialized to null, assigned after DOM loads
let imageUpload = null;
let originalCanvas = null;
let pixelatedCanvas = null;
let pixelWidth = null;
let pixelHeight = null;
let showGrid = null;
let originalOpacity = null;
let opacityValue = null;
let nextStepBtn = null;
let removeBg = null; // Remove background checkbox
let showColorLabels = null; // Show/hide color code toggle

// Result page original image opacity control
let resultOriginalOpacity = null;
let resultOpacityValue = null;
// Result page background removal checkbox
let resultRemoveBg = null; // Result page remove background checkbox

// Result page elements
let resultCanvas = null;
let zoomSlider = null; // Drawing zoom slider
let zoomLevelValue = null; // Zoom level display
let colorGrid = null;
let statsGrid = null;
let totalCountEl = null;
let backBtn = null;
let downloadBtn = null;
let saveLibraryName = null;
let colorLibraryName = null;

// Guide line settings elements
let gridSettingsToggle = null;
let gridSettingsContent = null;
let showGridLinesCheckbox = null;
let gridSizeSelect = null;
let gridStartPosSelect = null;
let gridColorPicker = null;
let gridThicknessSlider = null;
let gridThicknessValue = null;

// Pixel block count adjustment sliders
let pixelCountX = null;
let pixelCountY = null;
let pixelCountXValue = null;
let pixelCountYValue = null;

// Canvas contexts
let originalCtx = null;
let pixelatedCtx = null;
let resultCtx = null;

// Preset color library (based on original project color theme)
const presetColors = [


];

// Initialize custom color library
function initColorLibrary() {
    // Check if color categories are saved in local storage first
    const savedCategories = localStorage.getItem('colorCategories');
    if (savedCategories) {
        colorCategories = JSON.parse(savedCategories);
        currentCategoryId = colorCategories[0].id;
        renderColorLibrary();
        return;
    }
    
    // If no local storage data, load from colors.json file
    fetch('colors.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(jsonData => {
            // Use the categories from the JSON file
            colorCategories = jsonData;
            currentCategoryId = colorCategories[0].id;
            renderColorLibrary();
        })
        .catch(error => {
            console.error('Error loading colors from JSON file:', error);
            // Fallback to preset colors if JSON loading fails
            colorCategories = [{
                id: "default",
                name: "默认分组",
                colors: [...presetColors]
            }];
            currentCategoryId = colorCategories[0].id;
            renderColorLibrary();
        });
}

// Initialize event listeners
function initEventListeners() {
    // Image upload event
    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }
    
    // Pixel size change events
    if (pixelWidth) {
        pixelWidth.addEventListener('input', updatePixelization);
    }
    if (pixelHeight) {
        pixelHeight.addEventListener('input', updatePixelization);
    }
    
    // Show grid toggle event
    if (showGrid) {
        showGrid.addEventListener('change', updatePixelization);
    }
    
    // Original image opacity event
    if (originalOpacity) {
        originalOpacity.addEventListener('input', updateOriginalOpacity);
    }
    
    // Preset button events
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Get preset pixel size
            const preset = this.getAttribute('data-preset');
            const [width, height] = preset.split('x').map(Number);
            
            // Set pixel size
            if (pixelWidth && pixelHeight) {
                pixelWidth.value = width;
                pixelHeight.value = height;
                
                // Update pixelization effect
                updatePixelization();
                
                // Show preset application message
                showUploadMessage(`Applied ${preset} preset`, 'success');
            }
        });
    });
    
    // Next step button event
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', function() {
            if (!originalImage) {
                showUploadMessage('Please upload an image first!', 'error');
                return;
            }
            
            // Switch to result page
            showResultPage();
        });
    }
    
    // Back to home button event
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            // Switch back to home page
            switchPage('#home');
        });
    }
    
    // Download button event
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            downloadResultImage();
        });
    }
    
    // Save color library name button event
    if (saveLibraryName) {
        saveLibraryName.addEventListener('click', function() {
            saveColorLibraryName();
        });
    }
    
    // Pixel block count adjustment slider events
    if (pixelCountX) {
        pixelCountX.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (pixelCountXValue && pixelCountY) {
                pixelCountXValue.textContent = value;
                updatePixelBlocks(value, parseInt(pixelCountY.value));
            }
        });
    }
    
    if (pixelCountY) {
        pixelCountY.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (pixelCountYValue && pixelCountX) {
                pixelCountYValue.textContent = value;
                updatePixelBlocks(parseInt(pixelCountX.value), value);
            }
        });
    }
    
    // Show/hide color codes toggle event
    if (showColorLabels) {
        showColorLabels.addEventListener('change', function() {
            // Re-render result page
            showResultPage();
        });
    }
    
    // Result page original image opacity control event
    if (resultOriginalOpacity) {
        resultOriginalOpacity.addEventListener('input', function() {
            const opacity = this.value / 100;
            // Update original image opacity
            updateResultOriginalOpacity(opacity);
        });
    }
    
    // Result page background removal checkbox event
    if (resultRemoveBg) {
        resultRemoveBg.addEventListener('change', function() {
            // Update global background removal state
            removeBg.checked = this.checked;
            // Re-calculate pixelization effect
            updatePixelization();
            // Update result page
            showResultPage();
        });
    }
    
    // Drawing zoom control event
    if (zoomSlider) {
        zoomSlider.addEventListener('input', function() {
            const zoomValue = this.value;
            zoomLevelValue.textContent = zoomValue;
            zoomLevel = zoomValue / 100;
            updateCanvasZoom();
        });
    }
    
    // Guide line settings event listeners
    if (gridSettingsToggle) {
        gridSettingsToggle.addEventListener('click', function() {
            gridSettingsContent.classList.toggle('active');
            this.textContent = gridSettingsContent.classList.contains('active') ? '▲' : '▼';
        });
    }
    
    if (showGridLinesCheckbox) {
        showGridLinesCheckbox.addEventListener('change', function() {
            showGridLines = this.checked;
            // If currently on result page, re-render
            const resultSection = document.querySelector('#result');
            if (resultSection && resultSection.classList.contains('active')) {
                showResultPage();
            }
        });
    }
    
    if (gridSizeSelect) {
        gridSizeSelect.addEventListener('change', function() {
            const [width, height] = this.value.split('x').map(Number);
            gridSize = {width, height};
            if (document.querySelector('#result').classList.contains('active')) {
                showResultPage();
            }
        });
    }
    
    if (gridStartPosSelect) {
        gridStartPosSelect.addEventListener('change', function() {
            gridStartPos = this.value;
            if (document.querySelector('#result').classList.contains('active')) {
                showResultPage();
            }
        });
    }
    
    if (gridColorPicker) {
        gridColorPicker.addEventListener('change', function() {
            gridColor = this.value;
            if (document.querySelector('#result').classList.contains('active')) {
                showResultPage();
            }
        });
    }
    
    if (gridThicknessSlider) {
        gridThicknessSlider.addEventListener('input', function() {
            gridThickness = parseInt(this.value);
            gridThicknessValue.textContent = this.value;
            if (document.querySelector('#result').classList.contains('active')) {
                showResultPage();
            }
        });
    }
}

// Update canvas zoom
function updateCanvasZoom() {
    if (resultCanvas) {
        resultCanvas.style.transform = `scale(${zoomLevel})`;
        resultCanvas.style.transformOrigin = 'top left';
        
        // Update canvas container size to ensure scrollbars work properly
        const container = resultCanvas.parentElement;
        if (container) {
            // Clear previous inline styles
            container.style.height = '';
            container.style.width = '';
        }
    }
}

// Draw guide lines
function drawGridLines(ctx, blocksX, blocksY, sizeX, sizeY, axisWidth) {
    if (!showGridLines) return;
    
    // Set guide line style
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = gridThickness;
    ctx.globalAlpha = 0.7;
    
    // Calculate starting offset
    let offsetX = 0;
    let offsetY = 0;
    
    if (gridStartPos === 'center') {
        // Calculate offset for center start position
        offsetX = (blocksX % gridSize.width) * sizeX / 2;
        offsetY = (blocksY % gridSize.height) * sizeY / 2;
    }
    
    // Draw vertical lines
    for (let x = 0; x <= blocksX; x += gridSize.width) {
        const lineX = axisWidth + offsetX + x * sizeX;
        
        ctx.beginPath();
        ctx.moveTo(lineX, axisWidth);
        ctx.lineTo(lineX, axisWidth + blocksY * sizeY);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= blocksY; y += gridSize.height) {
        const lineY = axisWidth + offsetY + y * sizeY;
        
        ctx.beginPath();
        ctx.moveTo(axisWidth, lineY);
        ctx.lineTo(axisWidth + blocksX * sizeX, lineY);
        ctx.stroke();
    }
    
    // Restore global alpha
    ctx.globalAlpha = 1.0;
}

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Add user feedback: show processing message
    showUploadMessage('Processing image...', 'info');
    
    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        showUploadMessage('Image size cannot exceed 5MB! Please select a smaller image.', 'error');
        return;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showUploadMessage('Unsupported image format! Please select JPG, PNG, GIF, or WEBP.', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    // Success reading file
    reader.onload = function(event) {
        const img = new Image();
        
        // Image loading success
        img.onload = function() {
            try {
                // Resize image to fit canvas (max 1200px)
                const canvasMaxSize = 1200;
                let width = img.width;
                let height = img.height;
                
                if (width > canvasMaxSize || height > canvasMaxSize) {
                    const ratio = Math.min(canvasMaxSize / width, canvasMaxSize / height);
                    width = Math.floor(width * ratio);
                    height = Math.floor(height * ratio);
                }
                
                // Set canvas size
                originalCanvas.width = pixelatedCanvas.width = canvasWidth = width;
                originalCanvas.height = pixelatedCanvas.height = canvasHeight = height;
                
                // Draw original image
                originalCtx.drawImage(img, 0, 0, width, height);
                originalImage = img;
                
                // Initialize pixelization
                updatePixelization();
                
                // Enable next step button
                nextStepBtn.disabled = false;
                
                // Show success message
                showUploadMessage('Image uploaded successfully!', 'success');
            } catch (error) {
                showUploadMessage('Image processing failed! Please try again.', 'error');
                console.error('Image processing error:', error);
            }
        };
        
        // Image loading failed
        img.onerror = function() {
            showUploadMessage('Image loading failed! Please check if the image file is corrupted.', 'error');
        };
        
        img.src = event.target.result;
    };
    
    // Reading file failed
    reader.onerror = function() {
        showUploadMessage('Image reading failed! Please try again.', 'error');
    };
    
    reader.readAsDataURL(file);
}

// Show upload message
function showUploadMessage(message, type) {
    // Check if message element already exists
    let messageElement = document.getElementById('uploadMessage');
    
    // Create if doesn't exist
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'uploadMessage';
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
        document.body.appendChild(messageElement);
    }
    
    // Set message type and content
    if (type === 'error') {
        messageElement.style.backgroundColor = '#ff4757';
    } else if (type === 'success') {
        messageElement.style.backgroundColor = '#2ed573';
    } else {
        messageElement.style.backgroundColor = '#3742fa';
    }
    
    messageElement.textContent = message;
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translateX(0)';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateX(300px)';
    }, 3000);
}

// Pixelization function
function pixelizeImage() {
    if (!originalImage) return;
    
    // Get number of pixel blocks (now represents how many blocks to divide into)
    const blocksX = parseInt(pixelWidth.value);
    const blocksY = parseInt(pixelHeight.value);
    
    // Calculate actual size of each pixel block
    const sizeX = canvasWidth / blocksX;
    const sizeY = canvasHeight / blocksY;
    
    // Clear pixelated canvas
    pixelatedCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Clear pixel data
    pixelData = [];
    
    // Detect background color (if needed)
    let backgroundColor = null;
    if (removeBg && removeBg.checked) {
        backgroundColor = detectBackgroundColor();
    }
    
    // Process each pixel block
    for (let y = 0; y < blocksY; y++) {
        const row = [];
        for (let x = 0; x < blocksX; x++) {
            // Get average color of the pixel block
            const avgColor = getAverageColor(x * sizeX, y * sizeY, sizeX, sizeY);
            
            // Convert color to hex format
            const hexColor = rgbToHex(avgColor);
            
            // Find closest color in color library
            const closestColor = findClosestColor(hexColor);
            
            // Check if background needs to be removed
            let displayColor = closestColor;
            if (backgroundColor && isBackgroundColor(closestColor, backgroundColor)) {
                // Background pixels use transparent
                displayColor = 'transparent';
            }
            
            // Draw pixel block
            if (displayColor !== 'transparent') {
                pixelatedCtx.fillStyle = displayColor;
                pixelatedCtx.fillRect(x * sizeX, y * sizeY, sizeX, sizeY);
            }
            
            // Draw grid lines if enabled
            if (showGrid && showGrid.checked) {
                pixelatedCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                pixelatedCtx.lineWidth = 1;
                pixelatedCtx.strokeRect(x * sizeX, y * sizeY, sizeX, sizeY);
            }
            
            // Save pixel block color data
            row.push(displayColor);
        }
        pixelData.push(row);
    }
    
    // Update color statistics
    updateColorStats();
}

// Update pixel block count and recalculate pixelization
function updatePixelBlocks(width, height) {
    if (!originalImage) return;
    
    // Update pixel width and height values
    pixelWidth.value = width;
    pixelHeight.value = height;
    
    // Recalculate pixelization
    updatePixelization();
    
    // Update result page
    showResultPage();
}

// Update color statistics
function updateColorStats() {
    // Reset statistics
    colorStats = {};
    
    // Process all pixel block colors
    pixelData.forEach(row => {
        row.forEach(color => {
            // Ignore transparent background pixels
            if (color === 'transparent') return;
            
            // Use pixel block color directly (already in hex format)
            const hexColor = color;
            
            // Update statistics
            if (colorStats[hexColor]) {
                colorStats[hexColor]++;
            } else {
                colorStats[hexColor] = 1;
            }
        });
    });
}

// Convert RGB color string to hex
function rgbToHex(rgb) {
    // Match RGB values
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgb;
    
    // Convert to hex
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

// Convert hex color to RGB object
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse RGB values
    let r, g, b;
    if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    }
    
    return { r, g, b };
}

// Calculate Euclidean distance between two RGB colors
function calculateColorDistance(rgb1, rgb2) {
    // Convert RGB to objects
    const color1 = typeof rgb1 === 'string' ? hexToRgb(rgb1.replace('#', '')) : rgb1;
    const color2 = typeof rgb2 === 'string' ? hexToRgb(rgb2.replace('#', '')) : rgb2;
    
    // Calculate Euclidean distance
    const rDiff = color1.r - color2.r;
    const gDiff = color1.g - color2.g;
    const bDiff = color1.b - color2.b;
    
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

// Get color name by code (in current category)
function getColorNameByCode(colorCode) {
    const currentCategory = colorCategories.find(category => category.id === currentCategoryId);
    if (currentCategory) {
        const colorObj = currentCategory.colors.find(color => color.color.toLowerCase() === colorCode.toLowerCase());
        return colorObj ? colorObj.name : colorCode;
    }
    return colorCode;
}

// Find closest color in color library (in current category)
function findClosestColor(targetColor) {
    const currentCategory = colorCategories.find(category => category.id === currentCategoryId);
    if (!currentCategory || currentCategory.colors.length === 0) return targetColor;
    
    // Convert target color to RGB object
    const targetRgb = typeof targetColor === 'string' ? hexToRgb(targetColor.replace('#', '')) : targetColor;
    
    let closestColor = currentCategory.colors[0].color;
    let minDistance = calculateColorDistance(targetRgb, currentCategory.colors[0].color);
    
    // Find closest color in library
    for (let i = 1; i < currentCategory.colors.length; i++) {
        const currentColor = currentCategory.colors[i].color;
        const currentDistance = calculateColorDistance(targetRgb, currentColor);
        
        if (currentDistance < minDistance) {
            minDistance = currentDistance;
            closestColor = currentColor;
        }
    }
    
    return closestColor;
}

// Render category selection dropdown
function renderCategorySelect() {
    // Check if category select exists
    let categorySelect = document.getElementById('categorySelect');
    if (!categorySelect) {
        categorySelect = document.createElement('select');
        categorySelect.id = 'categorySelect';
        categorySelect.className = 'category-select';
        categorySelect.addEventListener('change', () => {
            currentCategoryId = categorySelect.value;
            renderColorLibrary();
            // Recalculate pixelization to use new color library
            updatePixelization();
            showResultPage();
        });
        
        // Add to color library container
        colorGrid.appendChild(categorySelect);
    }
    
    // Clear dropdown
    categorySelect.innerHTML = '';
    
    // Add all category options
    colorCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        if (category.id === currentCategoryId) {
            option.selected = true;
        }
        categorySelect.appendChild(option);
    });
}

// Create new category
function createNewCategory() {
    const categoryName = prompt('Please enter new category name:');
    if (categoryName === null) return; // User cancelled
    
    if (categoryName.trim() === '') {
        showUploadMessage('Category name cannot be empty!', 'error');
        return;
    }
    
    // Create new category
    const newCategory = {
        id: 'category_' + Date.now(),
        name: categoryName.trim(),
        colors: []
    };
    
    // Add to color categories
    colorCategories.push(newCategory);
    
    // Switch to new category
    currentCategoryId = newCategory.id;
    
    // Re-render color library
    renderColorLibrary();
    showUploadMessage('Category created successfully!', 'success');
}

// Edit category
function editCategory(categoryId) {
    const category = colorCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    const newName = prompt('Please enter new category name:', category.name);
    if (newName === null) return; // User cancelled
    
    if (newName.trim() === '') {
        showUploadMessage('Category name cannot be empty!', 'error');
        return;
    }
    
    category.name = newName.trim();
    renderColorLibrary();
    showUploadMessage('Category edited successfully!', 'success');
}

// Delete category
function deleteCategory(categoryId) {
    const category = colorCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    // Cannot delete default category
    if (category.id === 'default') {
        showUploadMessage('Default category cannot be deleted!', 'error');
        return;
    }
    
    // Confirm deletion
    if (confirm(`Are you sure you want to delete category "${category.name}"? This will delete all colors in this category!`)) {
        // Remove from categories
        colorCategories = colorCategories.filter(c => c.id !== categoryId);
        
        // Switch to default category if current category was deleted
        if (currentCategoryId === categoryId) {
            currentCategoryId = colorCategories[0].id;
        }
        
        // Re-render color library
        renderColorLibrary();
        showUploadMessage('Category deleted successfully!', 'success');
    }
}

// Move color to another category
function moveColorToCategory(colorIndex, sourceCategoryId, targetCategoryId) {
    const sourceCategory = colorCategories.find(c => c.id === sourceCategoryId);
    const targetCategory = colorCategories.find(c => c.id === targetCategoryId);
    
    if (!sourceCategory || !targetCategory) return;
    
    // Get color to move
    const colorToMove = sourceCategory.colors[colorIndex];
    if (!colorToMove) return;
    
    // Remove from source category
    sourceCategory.colors.splice(colorIndex, 1);
    
    // Add to target category
    targetCategory.colors.push(colorToMove);
    
    // Re-render color library
    renderColorLibrary();
    showUploadMessage('Color moved to new category!', 'success');
}

// Render color library
function renderColorLibrary() {
    // Check if library header exists
    let libraryHeader = document.getElementById('libraryHeader');
    if (!libraryHeader) {
        libraryHeader = document.createElement('div');
        libraryHeader.id = 'libraryHeader';
        libraryHeader.className = 'library-header';
        
        // Add header text
        const headerText = document.createElement('span');
        headerText.textContent = '颜色库';
        
        // Add dropdown icon
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'toggle-icon';
        toggleIcon.innerHTML = '▼';
        
        // Add elements to header container
        libraryHeader.appendChild(headerText);
        libraryHeader.appendChild(toggleIcon);
        
        // Add click event
        libraryHeader.addEventListener('click', () => {
            colorGrid.classList.toggle('collapsed');
            toggleIcon.classList.toggle('rotated');
        });
        
        // Add header to color library container
        colorGrid.parentNode.insertBefore(libraryHeader, colorGrid);
    }
    
    colorGrid.innerHTML = '';
    
    // Render category selection dropdown
    renderCategorySelect();
    
    // Create category management area
    const categoryManagement = document.createElement('div');
    categoryManagement.className = 'category-management';
    
    // Create new category button
    const createCategoryBtn = document.createElement('button');
    createCategoryBtn.className = 'create-category-btn';
    createCategoryBtn.innerHTML = '增加分组';
    createCategoryBtn.addEventListener('click', createNewCategory);
    categoryManagement.appendChild(createCategoryBtn);
    
    // Current category operation buttons
    const currentCategory = colorCategories.find(category => category.id === currentCategoryId);
    if (currentCategory && currentCategory.id !== 'default') {
        // Edit category button
        const editCategoryBtn = document.createElement('button');
        editCategoryBtn.className = 'edit-category-btn';
        editCategoryBtn.innerHTML = 'Edit Category';
        editCategoryBtn.addEventListener('click', () => editCategory(currentCategory.id));
        categoryManagement.appendChild(editCategoryBtn);
        
        // Delete category button
        const deleteCategoryBtn = document.createElement('button');
        deleteCategoryBtn.className = 'delete-category-btn';
        deleteCategoryBtn.innerHTML = 'Delete Category';
        deleteCategoryBtn.addEventListener('click', () => deleteCategory(currentCategory.id));
        categoryManagement.appendChild(deleteCategoryBtn);
    }
    
    colorGrid.appendChild(categoryManagement);
    
    // Render current category colors
    if (currentCategory) {
        // Render category title
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'category-title';
        categoryTitle.innerHTML = `<h3>${currentCategory.name}</h3>`;
        colorGrid.appendChild(categoryTitle);
        
        // Render color items
        currentCategory.colors.forEach((colorObj, index) => {
            // Create color item container
            const colorContainer = document.createElement('div');
            colorContainer.className = 'color-container';
            
            // Create color circle
            const colorCircle = document.createElement('div');
            colorCircle.className = 'color-circle';
            colorCircle.style.backgroundColor = colorObj.color;
            colorCircle.setAttribute('data-color', colorObj.color);
            colorCircle.setAttribute('title', `${colorObj.name}: ${colorObj.color}`);
            
            // Create color info (name and code)
            const colorInfo = document.createElement('div');
            colorInfo.className = 'color-info';
            colorInfo.innerHTML = `
                <div class="color-name">${colorObj.name}</div>
                <div class="color-code">${colorObj.color}</div>
            `;
            
            // Create action buttons container
            const actionButtons = document.createElement('div');
            actionButtons.className = 'color-actions';
            
            // Add edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'color-edit-btn';
            editBtn.innerHTML = 'Edit';
            editBtn.style.fontSize = '0.7rem';
            editBtn.style.padding = '2px 4px';
            editBtn.style.marginRight = '2px';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering color circle click event
                editColor(index);
            });
            
            // Add delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'color-delete-btn';
            deleteBtn.innerHTML = 'Delete';
            deleteBtn.style.fontSize = '0.7rem';
            deleteBtn.style.padding = '2px 4px';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering color circle click event
                deleteColor(index);
            });
            
            // Add buttons to action container
            actionButtons.appendChild(editBtn);
            actionButtons.appendChild(deleteBtn);
            
            // Add all elements to container
            colorContainer.appendChild(colorCircle);
            colorContainer.appendChild(colorInfo);
            colorContainer.appendChild(actionButtons);
            
            // Add click event to color circle to show/hide action buttons
            colorCircle.addEventListener('click', () => {
                // Remove active state from other color items
                document.querySelectorAll('.color-container').forEach(container => {
                    container.classList.remove('active');
                });
                
                // Toggle active state for current color item
                colorContainer.classList.toggle('active');
            });
            
            colorGrid.appendChild(colorContainer);
        });
    }
    
    // Add add color button
    const addColorContainer = document.createElement('div');
    addColorContainer.className = 'color-container';
    
    const addColorBtn = document.createElement('div');
    addColorBtn.className = 'color-circle add-color-btn';
    addColorBtn.style.backgroundColor = '#f0f0f0';
    addColorBtn.innerHTML = '+';
    addColorBtn.style.display = 'flex';
    addColorBtn.style.justifyContent = 'center';
    addColorBtn.style.alignItems = 'center';
    addColorBtn.style.color = '#666';
    addColorBtn.style.fontWeight = 'bold';
    addColorBtn.style.fontSize = '1.5rem';
    addColorBtn.setAttribute('title', '增加色号');
    
    addColorBtn.addEventListener('click', addCustomColor);
    
    addColorContainer.appendChild(addColorBtn);
    colorGrid.appendChild(addColorContainer);
    
    // Save to localStorage
    saveColorLibrary();
}

// Select color
function selectColor(color) {
    // Remove all selected states
    document.querySelectorAll('.color-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add current selected state
    document.querySelector(`[data-color="${color}"]`).classList.add('selected');
    
    showUploadMessage(`Selected color ${color}`, 'info');
}

// Edit color
function editColor(index) {
    const currentCategory = colorCategories.find(category => category.id === currentCategoryId);
    if (!currentCategory) return;
    
    const colorObj = currentCategory.colors[index];
    if (!colorObj) return;
    
    // Show edit dialog
    const newName = prompt('Please enter new color name:', colorObj.name);
    if (newName === null) return; // User cancelled
    
    const newColor = prompt('Please enter RGB color value (format: rgb(255, 0, 0)) or hex color code (format: #ff0000):', colorObj.color);
    if (newColor === null) return; // User cancelled
    
    // Validate color format
    if (/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.test(newColor) || /^#[0-9A-Fa-f]{6}$/.test(newColor)) {
        // Convert to hex format
        const hexColor = rgbToHex(newColor);
        
        // Update color object
        currentCategory.colors[index] = {
            name: newName.trim() || colorObj.name,
            color: hexColor
        };
        
        // Re-render color library
        renderColorLibrary();
        showUploadMessage(`Updated color ${hexColor}`, 'success');
    } else {
        showUploadMessage('Invalid color format! Please try again.', 'error');
    }
}

// Delete color
function deleteColor(index) {
    const currentCategory = colorCategories.find(category => category.id === currentCategoryId);
    if (!currentCategory) return;
    
    if (confirm('Are you sure you want to delete this color?')) {
        currentCategory.colors.splice(index, 1);
        renderColorLibrary();
        showUploadMessage('Color deleted successfully!', 'success');
    }
}

// Save color library to localStorage
function saveColorLibrary() {
    localStorage.setItem('colorCategories', JSON.stringify(colorCategories));
}

// Add custom color
function addCustomColor() {
    // Check if color form exists
    let colorForm = document.getElementById('customColorForm');
    if (colorForm) {
        colorForm.remove();
        return;
    }
    
    // Create form container
    colorForm = document.createElement('div');
    colorForm.id = 'customColorForm';
    colorForm.className = 'custom-color-form';
    
    // Create form content
    colorForm.innerHTML = `
        <div class="form-header">
            <h4>添加自定义颜色</h4>
            <button type="button" class="close-btn" id="closeColorForm">×</button>
        </div>
        <div class="form-body">
            <div class="form-group">
                <label for="colorName">颜色名:</label>
                <input type="text" id="colorName" placeholder="Enter color name" required>
            </div>
            <div class="form-group">
                <label for="colorHex">颜色代码（十六进制）：</label>
                <input type="text" id="colorHex" placeholder="#RRGGBB" pattern="^#[0-9A-Fa-f]{6}$" required>
            </div>
            <div class="form-group">
                <label for="colorRGB">RGB Values:</label>
                <div class="rgb-inputs">
                    <input type="number" id="red" min="0" max="255" placeholder="R" required>
                    <input type="number" id="green" min="0" max="255" placeholder="G" required>
                    <input type="number" id="blue" min="0" max="255" placeholder="B" required>
                </div>
            </div>
            <div class="color-preview" id="colorPreview"></div>
        </div>
        <div class="form-footer">
            <button type="button" class="cancel-btn" id="cancelColorBtn">Cancel</button>
            <button type="button" class="add-btn" id="confirmColorBtn">Add Color</button>
        </div>
    `;
    
    // Add to color library container
    colorGrid.appendChild(colorForm);
    
    // Get form elements
    const colorName = document.getElementById('colorName');
    const colorHex = document.getElementById('colorHex');
    const red = document.getElementById('red');
    const green = document.getElementById('green');
    const blue = document.getElementById('blue');
    const colorPreview = document.getElementById('colorPreview');
    const closeBtn = document.getElementById('closeColorForm');
    const cancelBtn = document.getElementById('cancelColorBtn');
    const confirmBtn = document.getElementById('confirmColorBtn');
    
    // Add color preview functionality
    function updateColorPreview() {
        let color = '#f0f0f0';
        if (colorHex.value.match(/^#[0-9A-Fa-f]{6}$/)) {
            color = colorHex.value;
        } else if (red.value && green.value && blue.value) {
            color = rgbToHex(`rgb(${red.value}, ${green.value}, ${blue.value})`);
        }
        colorPreview.style.backgroundColor = color;
    }
    
    // Add event listeners
    colorHex.addEventListener('input', () => {
        updateColorPreview();
    });
    
    [red, green, blue].forEach(input => {
        input.addEventListener('input', () => {
            if (red.value && green.value && blue.value) {
                colorHex.value = rgbToHex(`rgb(${red.value}, ${green.value}, ${blue.value})`);
                updateColorPreview();
            }
        });
    });
    
    // Close form
    function closeForm() {
        colorForm.remove();
    }
    
    closeBtn.addEventListener('click', closeForm);
    cancelBtn.addEventListener('click', closeForm);
    
    // Confirm adding color
    confirmBtn.addEventListener('click', () => {
        if (!colorName.value) {
            showUploadMessage('Please enter color name', 'error');
            return;
        }
        
        let finalColor;
        if (colorHex.value.match(/^#[0-9A-Fa-f]{6}$/)) {
            finalColor = colorHex.value;
        } else if (red.value && green.value && blue.value) {
            finalColor = rgbToHex(`rgb(${red.value}, ${green.value}, ${blue.value})`);
        } else {
            showUploadMessage('Please enter valid color value', 'error');
            return;
        }
        
        // Get current category
        const currentCategory = colorCategories.find(category => category.id === currentCategoryId);
        if (!currentCategory) return;
        
        // Check if color exists
        const exists = currentCategory.colors.some(colorObj => colorObj.color.toLowerCase() === finalColor.toLowerCase());
        if (!exists) {
            currentCategory.colors.push({
                name: colorName.value.trim(),
                color: finalColor
            });
            renderColorLibrary();
            showUploadMessage(`Added custom color ${finalColor}`, 'success');
            closeForm();
        } else {
            showUploadMessage(`Color ${finalColor} already exists in current category`, 'error');
        }
    });
    
    // Initialize color preview
    updateColorPreview();
}

// Get average color of specified area
function getAverageColor(x, y, width, height) {
    // Get pixel data
    const imageData = originalCtx.getImageData(x, y, width, height);
    const data = imageData.data;
    
    let r = 0, g = 0, b = 0;
    const pixelCount = data.length / 4;
    
    // Calculate average RGB values
    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
    }
    
    r = Math.floor(r / pixelCount);
    g = Math.floor(g / pixelCount);
    b = Math.floor(b / pixelCount);
    
    return `rgb(${r}, ${g}, ${b})`;
}

// Detect background color (based on image edge pixels and color frequency statistics)
function detectBackgroundColor() {
    if (!originalImage) return null;
    
    const borderSize = 2; // Reduced sampling interval, increased edge sampling density
    const samplePoints = [];
    
    // Sample image edge pixels (top/bottom/left/right)
    for (let x = 0; x < canvasWidth; x += borderSize) {
        samplePoints.push(originalCtx.getImageData(x, 0, 1, 1).data); // Top
        samplePoints.push(originalCtx.getImageData(x, canvasHeight - 1, 1, 1).data); // Bottom
    }
    for (let y = 0; y < canvasHeight; y += borderSize) {
        samplePoints.push(originalCtx.getImageData(0, y, 1, 1).data); // Left
        samplePoints.push(originalCtx.getImageData(canvasWidth - 1, y, 1, 1).data); // Right
    }
    
    // Add internal sample points (100 random points)
    const innerSampleCount = 100;
    for (let i = 0; i < innerSampleCount; i++) {
        const randomX = Math.floor(Math.random() * canvasWidth);
        const randomY = Math.floor(Math.random() * canvasHeight);
        samplePoints.push(originalCtx.getImageData(randomX, randomY, 1, 1).data);
    }
    
    // Color frequency statistics (replaces original average color algorithm)
    const colorCounts = {};
    samplePoints.forEach(pixel => {
        const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
    });
    
    // Get most frequent color as background color
    let maxCount = 0;
    let backgroundColor = null;
    for (const [color, count] of Object.entries(colorCounts)) {
        if (count > maxCount) {
            maxCount = count;
            backgroundColor = color;
        }
    }
    
    return backgroundColor;
}

// Check if color is background color
function isBackgroundColor(color, backgroundColor, tolerance = 40) {
    const rgb1 = hexToRgb(color);
    const rgb2 = hexToRgb(backgroundColor);
    
    if (!rgb1 || !rgb2) return false;
    
    const distance = calculateColorDistance(rgb1, rgb2);
    return distance < tolerance;
}

// Update pixelization effect
function updatePixelization() {
    if (!originalImage) return;
    pixelizeImage();
}

// Update original image opacity
function updateOriginalOpacity() {
    const opacity = originalOpacity.value / 100;
    originalCanvas.style.opacity = opacity;
    opacityValue.textContent = `${originalOpacity.value}%`;
}

// Update result page original image opacity
function updateResultOriginalOpacity(opacity) {
    if (!resultOriginalOpacity || !resultOpacityValue) return;
    
    // Update display value
    const opacityPercent = Math.round(opacity * 100);
    resultOriginalOpacity.value = opacityPercent;
    resultOpacityValue.textContent = `${opacityPercent}%`;
    
    // Re-render result page
    showResultPage();
}

// Navigation bar toggle functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pageSections = document.querySelectorAll('.page-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target page ID
            const targetId = this.getAttribute('href');
            
            // Remove active class from all nav links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to current nav link
            this.classList.add('active');
            
            // Remove active class from all page sections
            pageSections.forEach(section => section.classList.remove('active'));
            
            // Add active class to target page section
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}



// Initialize profile avatar
function initProfileAvatar() {
    const avatarCanvas = document.querySelector('.profile-avatar canvas');
    if (!avatarCanvas) return;
    
    const ctx = avatarCanvas.getContext('2d');
    const size = avatarCanvas.width;
    
    // Draw simple avatar
    ctx.clearRect(0, 0, size, size);
    
    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, size, size);
    
    // Face
    ctx.fillStyle = '#ffdab9';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(size * 0.4, size * 0.4, size * 0.08, 0, Math.PI * 2);
    ctx.arc(size * 0.6, size * 0.4, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth
    ctx.strokeStyle = '#333';
    ctx.lineWidth = size * 0.03;
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.6, size * 0.15, 0, Math.PI);
    ctx.stroke();
}

// Render color statistics
function renderColorStats() {
    statsGrid.innerHTML = '';
    let totalCount = 0;
    
    // Sort colors by frequency
    const sortedColors = Object.entries(colorStats).sort((a, b) => b[1] - a[1]);
    
    // Render each color's statistics
    sortedColors.forEach(([color, count]) => {
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        
        statItem.innerHTML = `
            <div class="stat-color" style="background-color: ${color}"></div>
            <div class="stat-info">
                <span class="stat-color-code" data-color="${color}">${getColorNameByCode(color)}</span>
                <span class="stat-count">${count}</span>
            </div>
        `;
        
        // Add click event listener
        const colorCodeEl = statItem.querySelector('.stat-color-code');
        colorCodeEl.addEventListener('click', () => {
            highlightColorAreas(color);
        });
        
        statsGrid.appendChild(statItem);
        totalCount += count;
    });
    
    // Update total count
    totalCountEl.textContent = totalCount;
}

// Highlight all areas in the image with the corresponding color
function highlightColorAreas(color) {
    // Clear previous highlight effect
    const blocksX = parseInt(pixelWidth.value);
    const blocksY = parseInt(pixelHeight.value);
    const sizeX = canvasWidth / blocksX;
    const sizeY = canvasHeight / blocksY;
    
    // Calculate space needed for axes
    const axisWidth = 30;
    
    // Redraw pixelated image (considering axis offset)
    resultCtx.drawImage(pixelatedCanvas, axisWidth, axisWidth);
    
    // Redraw color code labels
    for (let y = 0; y < blocksY; y++) {
        for (let x = 0; x < blocksX; x++) {
            const blockColor = pixelData[y][x];
            
            // Skip transparent background pixels
            if (blockColor === 'transparent') continue;
            
            const colorName = getColorNameByCode(blockColor);
            
            // Calculate text position (center of pixel block, considering axis offset)
            const textX = axisWidth + x * sizeX + sizeX / 2;
            const textY = axisWidth + y * sizeY + sizeY / 2;
            
            // Dynamically adjust font size based on pixel block size
            const fontSize = Math.max(8, Math.min(12, sizeX * 0.7, sizeY * 0.7));
            resultCtx.font = `${fontSize}px Arial`;
            resultCtx.textAlign = 'center';
            resultCtx.textBaseline = 'middle';
            
            // Set text color to contrasting color
            const rgb = hexToRgb(blockColor);
            const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
            
            // Only draw color codes if pixel block is large enough and show color labels is enabled
            if (sizeX > 15 && sizeY > 15 && showColorLabels && showColorLabels.checked) {
                // Draw text background for better readability
                resultCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                const textWidth = resultCtx.measureText(colorName).width;
                resultCtx.fillRect(textX - textWidth/2 - 3, textY - fontSize/2 - 2, textWidth + 6, fontSize + 4);
                
                // Draw color code
                resultCtx.fillStyle = luminance > 0.5 ? '#000000' : '#ffffff';
                resultCtx.fillText(colorName, textX, textY);
            }
        }
    }
    
    // Highlight matching color areas
    let firstMatch = true;
    resultCtx.strokeStyle = '#ff0000';
    resultCtx.lineWidth = 2;
    resultCtx.globalAlpha = 0.7;
    
    for (let y = 0; y < blocksY; y++) {
        for (let x = 0; x < blocksX; x++) {
            const blockColor = pixelData[y][x];
            
            // If color matches, add highlight border (considering axis offset)
            if (blockColor === color) {
                resultCtx.strokeRect(axisWidth + x * sizeX, axisWidth + y * sizeY, sizeX, sizeY);
                
                // Scroll to first matching position
                if (firstMatch) {
                    // Calculate position of matching area
                    const matchPosition = resultCanvas.getBoundingClientRect();
                    const matchTop = matchPosition.top + axisWidth + (y * sizeY) - window.innerHeight / 2;
                    
                    // Smooth scroll
                    window.scrollTo({
                        top: window.pageYOffset + matchTop,
                        behavior: 'smooth'
                    });
                    
                    firstMatch = false;
                }
            }
        }
    }
    
    // Restore alpha
    resultCtx.globalAlpha = 1;
}

// Save color library name
function saveColorLibraryName() {
    const libraryName = document.getElementById('colorLibraryName').value.trim();
    if (libraryName) {
        localStorage.setItem('colorLibraryName', libraryName);
        showUploadMessage('Color library name saved', 'success');
    } else {
        showUploadMessage('Please enter valid color library name', 'error');
    }
}

// Load color library name
function loadColorLibraryName() {
    const savedName = localStorage.getItem('colorLibraryName');
    if (savedName) {
        document.getElementById('colorLibraryName').value = savedName;
    }
}

// Show result page
function showResultPage() {
    // Get current settings
    const blocksX = parseInt(pixelWidth.value);
    const blocksY = parseInt(pixelHeight.value);
    const sizeX = canvasWidth / blocksX;
    const sizeY = canvasHeight / blocksY;
    
    // Calculate space needed for axes
    const axisWidth = 30;
    
    // Set result canvas size (including axis space)
    resultCanvas.width = canvasWidth + axisWidth;
    resultCanvas.height = canvasHeight + axisWidth;
    
    // Clear canvas
    resultCtx.fillStyle = '#ffffff';
    resultCtx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);
    
    // Draw axes
    resultCtx.fillStyle = '#000000';
    resultCtx.font = '12px Arial';
    resultCtx.textAlign = 'center';
    resultCtx.textBaseline = 'middle';
    
    // Draw horizontal axes (top)
    for (let x = 0; x < blocksX; x++) {
        const textX = axisWidth + x * sizeX + sizeX / 2;
        const textY = axisWidth / 2;
        resultCtx.fillText(x + 1, textX, textY);
    }
    
    // Draw vertical axes (left)
    for (let y = 0; y < blocksY; y++) {
        const textX = axisWidth / 2;
        const textY = axisWidth + y * sizeY + sizeY / 2;
        resultCtx.fillText(y + 1, textX, textY);
    }
    
    // Draw horizontal axes (bottom)
    for (let x = 0; x < blocksX; x++) {
        const textX = axisWidth + x * sizeX + sizeX / 2;
        const textY = axisWidth + blocksY * sizeY + axisWidth / 2;
        resultCtx.fillText(x + 1, textX, textY);
    }
    
    // Draw vertical axes (right)
    for (let y = 0; y < blocksY; y++) {
        const textX = axisWidth + blocksX * sizeX + axisWidth / 2;
        const textY = axisWidth + y * sizeY + sizeY / 2;
        resultCtx.fillText(y + 1, textX, textY);
    }
    
    // Draw original image (apply opacity)
    const opacity = resultOriginalOpacity ? resultOriginalOpacity.value / 100 : 1.0;
    resultCtx.globalAlpha = opacity;
    resultCtx.drawImage(originalCanvas, axisWidth, axisWidth);
    resultCtx.globalAlpha = 1.0;
    
    // Draw pixelated image to result canvas (offset by axis space)
    resultCtx.drawImage(pixelatedCanvas, axisWidth, axisWidth);
    
    // Add color code labels to pixel blocks
    for (let y = 0; y < blocksY; y++) {
        for (let x = 0; x < blocksX; x++) {
            const color = pixelData[y][x];
            
            // Skip transparent background pixels
            if (color === 'transparent') continue;
            
            const colorName = getColorNameByCode(color);
            
            // Calculate text position (center of pixel block, considering axis offset)
            const textX = axisWidth + x * sizeX + sizeX / 2;
            const textY = axisWidth + y * sizeY + sizeY / 2;
            
            // Dynamically adjust font size based on pixel block size
            const fontSize = Math.max(8, Math.min(12, sizeX * 0.7, sizeY * 0.7));
            resultCtx.font = `${fontSize}px Arial`;
            resultCtx.textAlign = 'center';
            resultCtx.textBaseline = 'middle';
            
            // Set text color to contrasting color
            const rgb = hexToRgb(color);
            const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
            
            // Only draw color codes if pixel block is large enough and show color labels is enabled
            if (sizeX > 15 && sizeY > 15 && showColorLabels && showColorLabels.checked) {
                // Draw text background for better readability
                resultCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                const textWidth = resultCtx.measureText(colorName).width;
                resultCtx.fillRect(textX - textWidth/2 - 3, textY - fontSize/2 - 2, textWidth + 6, fontSize + 4);
                
                // Draw color name
                resultCtx.fillStyle = luminance > 0.5 ? '#000000' : '#ffffff';
                resultCtx.fillText(colorName, textX, textY);
            }
        }
    }

    // Draw guide lines
    drawGridLines(resultCtx, blocksX, blocksY, sizeX, sizeY, axisWidth);

    // Render color library
    renderColorLibrary();
    
    // Render color statistics
    renderColorStats();
    
    // Set slider initial values
    const currentWidth = parseInt(pixelWidth.value);
    const currentHeight = parseInt(pixelHeight.value);
    pixelCountX.value = currentWidth;
    pixelCountY.value = currentHeight;
    pixelCountXValue.textContent = currentWidth;
    pixelCountYValue.textContent = currentHeight;
    
    // Sync background removal checkbox state
    if (resultRemoveBg) {
        resultRemoveBg.checked = removeBg.checked;
    }
    
    // Switch to result page
    switchPage('#result');
}

// Page switching function
function switchPage(pageId) {
    // Get all page sections
    const pageSections = document.querySelectorAll('.page-section');
    
    // Remove active class from all page sections
    pageSections.forEach(section => section.classList.remove('active'));
    
    // Add active class to target page section
    const targetSection = document.querySelector(pageId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // If switching to result page, load color library name
        if (pageId === '#result') {
            loadColorLibraryName();
        }
    }
    
    // Update navigation link state
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === pageId) {
            link.classList.add('active');
        }
    });
}

// Download result image
function downloadResultImage() {
    // Create new Canvas for final image composition
    const downloadCanvas = document.createElement('canvas');
    const downloadCtx = downloadCanvas.getContext('2d');
    
    // Set canvas size
    downloadCanvas.width = resultCanvas.width;
    downloadCanvas.height = resultCanvas.height;
    
    // Draw content
    downloadCtx.fillStyle = '#ffffff';
    downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
    downloadCtx.drawImage(resultCanvas, 0, 0);
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'pixel_art.png';
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    imageUpload = document.getElementById('imageUpload');
    originalCanvas = document.getElementById('originalCanvas');
    pixelatedCanvas = document.getElementById('pixelatedCanvas');
    pixelWidth = document.getElementById('pixelWidth');
    pixelHeight = document.getElementById('pixelHeight');
    showGrid = document.getElementById('showGrid');
    originalOpacity = document.getElementById('originalOpacity');
    opacityValue = document.getElementById('opacityValue');
    nextStepBtn = document.getElementById('nextStepBtn');
    removeBg = document.getElementById('removeBg');
    showColorLabels = document.getElementById('showColorLabels');
    
    // Result page elements
    resultOriginalOpacity = document.getElementById('resultOriginalOpacity');
    resultOpacityValue = document.getElementById('resultOpacityValue');
    resultRemoveBg = document.getElementById('resultRemoveBg');
    resultCanvas = document.getElementById('resultCanvas');
    zoomSlider = document.getElementById('zoomSlider');
    zoomLevelValue = document.getElementById('zoomLevelValue');
    colorGrid = document.getElementById('colorGrid');
    statsGrid = document.getElementById('statsGrid');
    totalCountEl = document.getElementById('totalCount');
    backBtn = document.getElementById('backBtn');
    downloadBtn = document.getElementById('downloadBtn');
    saveLibraryName = document.getElementById('saveLibraryName');
    colorLibraryName = document.getElementById('colorLibraryName');
    
    // Guide line settings elements
    gridSettingsToggle = document.querySelector('.grid-settings-toggle');
    gridSettingsContent = document.querySelector('.grid-settings-content');
    showGridLinesCheckbox = document.getElementById('showGridLines');
    gridSizeSelect = document.getElementById('gridSize');
    gridStartPosSelect = document.getElementById('gridStartPos');
    gridColorPicker = document.getElementById('gridColor');
    gridThicknessSlider = document.getElementById('gridThickness');
    gridThicknessValue = document.getElementById('gridThicknessValue');
    
    // Pixel block count adjustment sliders
    pixelCountX = document.getElementById('pixelCountX');
    pixelCountY = document.getElementById('pixelCountY');
    pixelCountXValue = document.getElementById('pixelCountXValue');
    pixelCountYValue = document.getElementById('pixelCountYValue');
    
    // Get canvas contexts
    originalCtx = originalCanvas.getContext('2d');
    pixelatedCtx = pixelatedCanvas.getContext('2d');
    resultCtx = resultCanvas.getContext('2d');
    
    // Initialize color library
    initColorLibrary();
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize navigation
    initNavigation();
    

    
    // Initialize profile avatar
    initProfileAvatar();
    
    // Load saved guide line settings
    loadGridSettings();
    
    // Show welcome message
    showUploadMessage('Welcome to Pixel Art Creator!', 'success');
});

// Save guide line settings to localStorage
function saveGridSettings() {
    const settings = {
        showGridLines,
        gridSize,
        gridStartPos,
        gridColor,
        gridThickness
    };
    localStorage.setItem('gridSettings', JSON.stringify(settings));
}

// Load guide line settings from localStorage
function loadGridSettings() {
    const savedSettings = localStorage.getItem('gridSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            showGridLines = settings.showGridLines || false;
            gridSize = settings.gridSize || {width: 5, height: 5};
            gridStartPos = settings.gridStartPos || 'top-left';
            gridColor = settings.gridColor || '#ff0000';
            gridThickness = settings.gridThickness || 2;
            
            // Update UI elements
            if (showGridLinesCheckbox) {
                showGridLinesCheckbox.checked = showGridLines;
            }
            if (gridSizeSelect) {
                gridSizeSelect.value = `${gridSize.width}x${gridSize.height}`;
            }
            if (gridStartPosSelect) {
                gridStartPosSelect.value = gridStartPos;
            }
            if (gridColorPicker) {
                gridColorPicker.value = gridColor;
            }
            if (gridThicknessSlider) {
                gridThicknessSlider.value = gridThickness;
            }
            if (gridThicknessValue) {
                gridThicknessValue.textContent = gridThickness;
            }
        } catch (error) {
            console.error('Error loading guide line settings:', error);
        }
    }
}