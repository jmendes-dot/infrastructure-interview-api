output "cluster_name" {
  description = "Created kind cluster name."
  value       = kind_cluster.interview.name
}

output "endpoint" {
  description = "Local application endpoint after running the bootstrap script."
  value       = "http://127.0.0.1:${var.api_host_port}"
}
