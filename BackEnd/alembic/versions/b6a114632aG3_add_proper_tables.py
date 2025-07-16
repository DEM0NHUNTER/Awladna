from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b6a114632aG3'
down_revision = 'previous_revision_id'
branch_labels = None
depends_on = None


def upgrade():
    # Create users table
    op.create_table(
        'users',
        sa.Column('user_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('username', sa.String(length=50), nullable=False, unique=True),
        sa.Column('email', sa.String(length=120), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(length=128), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # Create child_profiles table
    op.create_table(
        'child_profiles',
        sa.Column('child_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('birthdate', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # Create chat_logs table
    op.create_table(
        'chat_logs',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False),
        sa.Column('child_id', sa.Integer(), sa.ForeignKey('child_profiles.child_id', ondelete='CASCADE'), nullable=True),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('timestamp', sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )


def downgrade():
    op.drop_table('chat_logs')
    op.drop_table('child_profiles')
    op.drop_table('users')
