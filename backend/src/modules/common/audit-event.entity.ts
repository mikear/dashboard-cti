import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

@Entity('audit_events')
export class AuditEventEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'event_type', type: 'varchar', length: 50 })
    eventType: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    entity: string;

    @Column({ name: 'entity_id', type: 'uuid', nullable: true })
    entityId: string;

    @Column({ type: 'varchar', length: 100 })
    action: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId: string;

    @Column({ name: 'ip_address', type: 'inet', nullable: true })
    ipAddress: string;

    @Column({ name: 'user_agent', type: 'text', nullable: true })
    userAgent: string;

    @Column({ type: 'jsonb', nullable: true })
    payload: any;

    @CreateDateColumn({ name: 'timestamp' })
    timestamp: Date;
}
