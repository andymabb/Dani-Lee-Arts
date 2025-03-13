document.addEventListener('DOMContentLoaded', function () {
    const projectMarketingSelect = document.getElementById('project_marketing');
    const otherInputContainer = document.getElementById('other_input_container');
    const otherInput = document.getElementById('other_input');

    // Ensure the dropdown exists before adding event listener
    if (projectMarketingSelect) {
        // Listen for changes in the select dropdown
        projectMarketingSelect.addEventListener('change', function () {
            if (projectMarketingSelect.value === 'other') {
                otherInputContainer.style.display = 'block';  // Show the input field if "Other" is selected
            } else {
                otherInputContainer.style.display = 'none';   // Hide the input field if another option is selected
                otherInput.value = '';                        // Clear the value when not 'Other'
            }
        });
    } else {
        console.error('Dropdown element #project_marketing not found!');
    }
});
