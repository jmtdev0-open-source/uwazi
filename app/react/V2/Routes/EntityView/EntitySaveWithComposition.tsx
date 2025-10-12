import React, { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router';
import { useAtom } from 'jotai';
import { Entity } from 'app/V2/domain/entities/Entity';
import { EntityCompositionSanitizer } from 'app/V2/application/services/sanitizers/EntityCompositionSanitizer';
import { EntitySaveUseCaseImpl } from 'app/V2/application/useCases/EntitySaveUseCase';
import { useEntitySave } from '../../CustomHooks/useEntitySave';
import { notificationAtom } from '../../atoms/notificationAtom';

const EntitySaveContent = ({ compositions }: { compositions: { full: Entity | null; dateFields: Entity | null; selectFields: Entity | null } }) => {
    const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [sanitizer] = useState(() => new EntityCompositionSanitizer());
    const [, setNotification] = useAtom(notificationAtom);
    const [saveUseCase] = useState(() => new EntitySaveUseCaseImpl(sanitizer, setNotification));

    const { saveEntity, loading, error, successMessage, clearMessages } = useEntitySave(saveUseCase);

    useEffect(() => {
        if (compositions.full && !editingEntity) {
            setEditingEntity(compositions.full);
            initializeFormData(compositions.full);
        }
    }, [compositions.full, editingEntity]);

    const initializeFormData = (entity: Entity) => {
        const formData: any = { title: entity.title, template: entity.template?._id, language: entity.language };

        if (entity.metadata) {
            Object.keys(entity.metadata).forEach(key => {
                const values = entity.metadata![key];
                if (Array.isArray(values) && values.length > 0) {
                    formData[key] = values.length === 1 ? values[0].value : values.map(v => v.value);
                }
            });
        }

        setFormData(formData);
    };

    const handleFormChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!editingEntity) return;
        clearMessages();

        try {
            await saveEntity(editingEntity._id, formData, { validate: true, showNotifications: true });
        } catch (error) {
            // Error handling is managed by the use case through notificationAtom
        }
    };

    if (!editingEntity) return <div>Loading entity...</div>;

    return (
        <div className="entity-save-container">
            <h2>Edit Entity: {editingEntity.title}</h2>

            {error && <div style={{ color: 'red', padding: '10px', margin: '10px 0' }}>Error: {error}</div>}
            {successMessage && <div style={{ color: 'green', padding: '10px', margin: '10px 0' }}>{successMessage}</div>}

            <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-field">
                    <label>Title:</label>
                    <input type="text" value={formData.title || ''} onChange={(e) => handleFormChange('title', e.target.value)} disabled={loading} />
                </div>
                <div className="form-field">
                    <label>Language:</label>
                    <input type="text" value={formData.language || ''} onChange={(e) => handleFormChange('language', e.target.value)} disabled={loading} />
                </div>
            </div>

            {editingEntity.metadata && (
                <div className="form-section">
                    <h3>Metadata</h3>
                    {Object.keys(editingEntity.metadata).map(key => (
                        <div key={key} className="form-field">
                            <label>{key}:</label>
                            <input type="text" value={formData[key] || ''} onChange={(e) => handleFormChange(key, e.target.value)} disabled={loading} />
                        </div>
                    ))}
                </div>
            )}

            <div className="form-actions">
                <button onClick={handleSave} disabled={loading} style={{ padding: '10px 20px', backgroundColor: loading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Saving...' : 'Save Entity'}
                </button>
            </div>
        </div>
    );
};

export default function EntitySaveWithComposition() {
    const compositions = useLoaderData() as { full: Entity | null; dateFields: Entity | null; selectFields: Entity | null };

    return (
        <div className="entity-save-page">
            <h1>Entity Save with Composition</h1>
            <EntitySaveContent compositions={compositions} />
        </div>
    );
}