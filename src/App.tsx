import React, { useState, useEffect } from 'react';
import './App.css';

type Ingredient = {
    quantity: string;
    name: string;
};

type Recipe = {
    name: string;
    ingredients: Ingredient[];
    steps: string[];
};

const RECIPES_KEY = 'recipes';

const App: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [form, setForm] = useState({
        name: '',
        ingredientName: '',
        ingredientQty: '',
        ingredients: [] as Ingredient[],
        step: '',
        steps: [] as string[]
    });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [lastAdded, setLastAdded] = useState<Recipe | null>(null);

    // Search state
    const [search, setSearch] = useState('');
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[] | null>(null);
    const [searchFeedback, setSearchFeedback] = useState('');

    // Edit state
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        ingredientName: '',
        ingredientQty: '',
        ingredients: [] as Ingredient[],
        step: '',
        steps: [] as string[]
    });
    const [showEditConfirmation, setShowEditConfirmation] = useState(false);
    const [lastEdited, setLastEdited] = useState<{ idx: number, recipe: Recipe } | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(RECIPES_KEY);
        if (saved) setRecipes(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
    }, [recipes]);

    // Real-time search effect
    useEffect(() => {
        if (search.trim() === '') {
            setFilteredRecipes(null);
            setSearchFeedback('');
            return;
        }
        const lower = search.toLowerCase();
        const matches = recipes.filter(
            r =>
                r.name.toLowerCase().includes(lower) ||
                r.ingredients.some(ing =>
                    ing.name.toLowerCase().includes(lower) ||
                    ing.quantity.toLowerCase().includes(lower)
                ) ||
                r.steps.some(step => step.toLowerCase().includes(lower))
        );
        setFilteredRecipes(matches);
        setSearchFeedback(
            matches.length > 0
                ? `Found ${matches.length} recipe${matches.length > 1 ? 's' : ''} matching "${search}"`
                : `No recipes found for "${search}"`
        );
    }, [search, recipes]);

    // --- Add Recipe Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAddIngredient = (e?: React.FormEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        if (form.ingredientName.trim() !== '' && form.ingredientQty.trim() !== '') {
            setForm(f => ({
                ...f,
                ingredients: [...f.ingredients, { quantity: f.ingredientQty.trim(), name: f.ingredientName.trim() }],
                ingredientName: '',
                ingredientQty: ''
            }));
        }
    };

    const handleIngredientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAddIngredient(e);
        }
    };

    const handleRemoveIngredient = (idx: number) => {
        setForm(f => ({
            ...f,
            ingredients: f.ingredients.filter((_, i) => i !== idx)
        }));
    };

    const handleStepChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setForm({ ...form, step: e.target.value });
    };

    const handleAddStep = (e?: React.FormEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        if (form.step.trim() !== '') {
            setForm(f => ({
                ...f,
                steps: [...f.steps, f.step.trim()],
                step: ''
            }));
        }
    };

    const handleStepKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddStep(e);
        }
    };

    const handleRemoveStep = (idx: number) => {
        setForm(f => ({
            ...f,
            steps: f.steps.filter((_, i) => i !== idx)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || form.ingredients.length === 0 || form.steps.length === 0) return;
        const newRecipe: Recipe = {
            name: form.name,
            ingredients: form.ingredients,
            steps: form.steps
        };
        setRecipes(prev => [...prev, newRecipe]);
        setLastAdded(newRecipe);
        setShowConfirmation(true);
        setForm({ name: '', ingredientName: '', ingredientQty: '', ingredients: [], step: '', steps: [] });
    };

    const handleUndo = () => {
        if (!lastAdded) return;
        setRecipes(prev => prev.slice(0, -1));
        setShowConfirmation(false);
        setLastAdded(null);
    };

    // --- Edit Handlers ---
    const startEdit = (idx: number) => {
        setEditingIdx(idx);
        setEditForm({
            name: recipes[idx].name,
            ingredientName: '',
            ingredientQty: '',
            ingredients: [...recipes[idx].ingredients],
            step: '',
            steps: [...recipes[idx].steps]
        });
        setShowEditConfirmation(false);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditAddIngredient = (e?: React.FormEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        if (editForm.ingredientName.trim() !== '' && editForm.ingredientQty.trim() !== '') {
            setEditForm(f => ({
                ...f,
                ingredients: [...f.ingredients, { quantity: f.ingredientQty.trim(), name: f.ingredientName.trim() }],
                ingredientName: '',
                ingredientQty: ''
            }));
        }
    };

    const handleEditIngredientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleEditAddIngredient(e);
        }
    };

    const handleEditRemoveIngredient = (idx: number) => {
        setEditForm(f => ({
            ...f,
            ingredients: f.ingredients.filter((_, i) => i !== idx)
        }));
    };

    const handleEditStepChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditForm({ ...editForm, step: e.target.value });
    };

    const handleEditAddStep = (e?: React.FormEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        if (editForm.step.trim() !== '') {
            setEditForm(f => ({
                ...f,
                steps: [...f.steps, f.step.trim()],
                step: ''
            }));
        }
    };

    const handleEditStepKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEditAddStep(e);
        }
    };

    const handleEditRemoveStep = (idx: number) => {
        setEditForm(f => ({
            ...f,
            steps: f.steps.filter((_, i) => i !== idx)
        }));
    };

    const handleEditSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.name || editForm.ingredients.length === 0 || editForm.steps.length === 0 || editingIdx === null) return;
        setLastEdited({ idx: editingIdx, recipe: recipes[editingIdx] });
        const updated = [...recipes];
        updated[editingIdx] = {
            name: editForm.name,
            ingredients: editForm.ingredients,
            steps: editForm.steps
        };
        setRecipes(updated);
        setShowEditConfirmation(true);
        setEditingIdx(null);
    };

    const handleEditCancel = () => {
        setEditingIdx(null);
        setShowEditConfirmation(false);
    };

    const handleUndoEdit = () => {
        if (!lastEdited) return;
        const updated = [...recipes];
        updated[lastEdited.idx] = lastEdited.recipe;
        setRecipes(updated);
        setShowEditConfirmation(false);
        setLastEdited(null);
    };

    // Search handlers
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleUndoSearch = () => {
        setSearch('');
        setFilteredRecipes(null);
        setSearchFeedback('');
    };

    // Recipes to display
    const recipesToShow = filteredRecipes !== null ? filteredRecipes : recipes;

    return (
        <div className="app-container">
            <header className="header">
                <h1 className="title">RecipeMe</h1>
            </header>

            <main>
                <section className="form-section">
                    <h2>Add a New Recipe</h2>
                    <form onSubmit={handleSubmit} className="recipe-form">
                        <div className="form-group">
                            <label>
                                Name:
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                        </div>
                        <div className="form-group">
                            <label>
                                Ingredients:
                                <div className="ingredient-input-row">
                                    <input
                                        name="ingredientQty"
                                        value={form.ingredientQty}
                                        onChange={handleChange}
                                        placeholder="Quantity (e.g. 2 cups)"
                                        style={{ width: '40%' }}
                                        onKeyDown={handleIngredientKeyDown}
                                    />
                                    <input
                                        name="ingredientName"
                                        value={form.ingredientName}
                                        onChange={handleChange}
                                        placeholder="Ingredient name"
                                        style={{ width: '55%' }}
                                        onKeyDown={handleIngredientKeyDown}
                                    />
                                    <button onClick={handleAddIngredient} className="add-ingredient-btn" type="button">Add</button>
                                </div>
                                <ul className="ingredient-list">
                                    {form.ingredients.map((ing, idx) => (
                                        <li key={idx}>
                                            <span style={{ fontWeight: 500 }}>{ing.quantity}</span> {ing.name}
                                            <button type="button" className="remove-ingredient-btn" onClick={() => handleRemoveIngredient(idx)}>×</button>
                                        </li>
                                    ))}
                                </ul>
                            </label>
                        </div>
                        <div className="form-group">
                            <label>
                                Preparation Steps:
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <textarea
                                        name="step"
                                        value={form.step}
                                        onChange={handleStepChange}
                                        onKeyDown={handleStepKeyDown}
                                        placeholder="Write a step and press Enter"
                                        rows={2}
                                        style={{ flex: 1 }}
                                    />
                                    <button onClick={handleAddStep} className="add-ingredient-btn" type="button">Add</button>
                                </div>
                                <ul className="ingredient-list">
                                    {form.steps.map((step, idx) => (
                                        <li key={idx}>
                                            Step {idx + 1}: {step}
                                            <button type="button" className="remove-ingredient-btn" onClick={() => handleRemoveStep(idx)}>×</button>
                                        </li>
                                    ))}
                                </ul>
                            </label>
                        </div>
                        <button type="submit" className="submit-btn">Add Recipe</button>
                    </form>
                    {showConfirmation && (
                        <div className="confirmation">
                            Recipe added!
                            <button onClick={handleUndo} className="undo-btn">Undo</button>
                        </div>
                    )}
                </section>

                <section className="search-section">
                    <h2>Search Recipes</h2>
                    <div className="search-row">
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search by name, ingredient, or step..."
                            className="search-input"
                        />
                        {search && (
                            <button onClick={handleUndoSearch} className="undo-search-btn" type="button">
                                Undo Search
                            </button>
                        )}
                    </div>
                    {searchFeedback && (
                        <div className="search-feedback">{searchFeedback}</div>
                    )}
                </section>

                <section className="recipes-section">
                    <h2>Recipes</h2>
                    <ul className="recipes-list">
                        {recipesToShow.map((r, idx) => (
                            <li key={idx} className="recipe-card">
                                {editingIdx === idx ? (
                                    <form onSubmit={handleEditSave} className="recipe-form">
                                        <div className="form-group">
                                            <label>
                                                Name:
                                                <input
                                                    name="name"
                                                    value={editForm.name}
                                                    onChange={handleEditChange}
                                                    required
                                                />
                                            </label>
                                        </div>
                                        <div className="form-group">
                                            <label>
                                                Ingredients:
                                                <div className="ingredient-input-row">
                                                    <input
                                                        name="ingredientQty"
                                                        value={editForm.ingredientQty}
                                                        onChange={handleEditChange}
                                                        placeholder="Quantity"
                                                        style={{ width: '40%' }}
                                                        onKeyDown={handleEditIngredientKeyDown}
                                                    />
                                                    <input
                                                        name="ingredientName"
                                                        value={editForm.ingredientName}
                                                        onChange={handleEditChange}
                                                        placeholder="Ingredient name"
                                                        style={{ width: '55%' }}
                                                        onKeyDown={handleEditIngredientKeyDown}
                                                    />
                                                    <button onClick={handleEditAddIngredient} className="add-ingredient-btn" type="button">Add</button>
                                                </div>
                                                <ul className="ingredient-list">
                                                    {editForm.ingredients.map((ing, i) => (
                                                        <li key={i}>
                                                            <span style={{ fontWeight: 500 }}>{ing.quantity}</span> {ing.name}
                                                            <button type="button" className="remove-ingredient-btn" onClick={() => handleEditRemoveIngredient(i)}>×</button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </label>
                                        </div>
                                        <div className="form-group">
                                            <label>
                                                Preparation Steps:
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <textarea
                                                        name="step"
                                                        value={editForm.step}
                                                        onChange={handleEditStepChange}
                                                        onKeyDown={handleEditStepKeyDown}
                                                        placeholder="Write a step and press Enter"
                                                        rows={2}
                                                        style={{ flex: 1 }}
                                                    />
                                                    <button onClick={handleEditAddStep} className="add-ingredient-btn" type="button">Add</button>
                                                </div>
                                                <ul className="ingredient-list">
                                                    {editForm.steps.map((step, i) => (
                                                        <li key={i}>
                                                            Step {i + 1}: {step}
                                                            <button type="button" className="remove-ingredient-btn" onClick={() => handleEditRemoveStep(i)}>×</button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </label>
                                        </div>
                                        <button type="submit" className="submit-btn">Save</button>
                                        <button type="button" className="undo-btn" onClick={handleEditCancel}>Cancel</button>
                                    </form>
                                ) : (
                                    <>
                                        <strong>{r.name}</strong>
                                        <div>
                                            <b>Ingredients:</b>
                                            <ul>
                                                {r.ingredients.map((ing, i) => (
                                                    <li key={i}>
                                                        <span style={{ fontWeight: 500 }}>{ing.quantity}</span> {ing.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <b>Steps:</b>
                                            <ol>
                                                {r.steps.map((step, i) => (
                                                    <li key={i}>{step}</li>
                                                ))}
                                            </ol>
                                        </div>
                                        <button className="add-ingredient-btn" style={{marginTop: '10px'}} onClick={() => startEdit(idx)}>Edit</button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                    {showEditConfirmation && (
                        <div className="confirmation">
                            Recipe updated!
                            <button onClick={handleUndoEdit} className="undo-btn">Undo</button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default App;